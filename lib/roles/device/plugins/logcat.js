var syrup = require('syrup')

var logger = require('../../../util/logger')
var wire = require('../../../wire')
var wireutil = require('../../../wire/util')
var lifecycle = require('../../../util/lifecycle')

module.exports = syrup.serial()
  .dependency(require('../support/adb'))
  .dependency(require('../support/router'))
  .dependency(require('../support/push'))
  .dependency(require('./owner'))
  .define(function(options, adb, router, push, owner) {
    var log = logger.createLogger('device:plugins:logcat')

    function openService() {
      log.info('Launching logcat service')
      return adb.openLogcat(options.serial)
        .timeout(10000)
        .then(function(logcat) {
          return lifecycle.share('Logcat', logcat)
        })
    }

    return openService()
      .then(function(logcat) {
        function reset() {
          logcat
            .resetFilters()
            .excludeAll()
        }

        function entryListener(entry) {
          push.send([
            owner.group
          , wireutil.envelope(new wire.DeviceLogcatEntryMessage(
              options.serial
            , entry.date.getTime() / 1000
            , entry.pid
            , entry.tid
            , entry.priority
            , entry.tag
            , entry.message
            ))
          ])
        }

        reset()
        logcat.on('entry', entryListener)

        router
          .on(wire.LogcatApplyFiltersMessage, function(channel, message) {
            reset()
            message.filters.forEach(function(filter) {
              logcat.include(filter.tag, filter.priority)
            })
          })

        return logcat
      })
  })