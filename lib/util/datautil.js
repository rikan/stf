var deviceData = require('stf-devices-db')
var express = require('express')

var pathutil = require('./pathutil')
var logger = require('./logger')

var log = logger.createLogger('util:datautil')

var aliases = {
  'KYY22': 'L02'
, 'SH-06DNERV': 'SH-06D_NERV'
}

var datautil = module.exports = Object.create(null)

datautil.applyData = function(device) {
  var model = device.model

  if (model) {
    var match = deviceData[model]

    if (!match) {
      if (aliases[model]) {
        match = deviceData[aliases[model]]
      }
      else {
        if (!match) {
          model = model.replace(/ /g, '_')
          match = deviceData[model]

          if (!match) {
            model = model.replace(/_/g, '')
            match = deviceData[model]
          }
        }
      }
    }

    if (match) {
      device.name = match.name.id
      device.releasedAt = match.date
      device.image = match.image.s.replace(/^small\//, '')
    }
    else {
      log.warn(
        'Device database does not have a match for device "%s" (model "%s")'
      , device.serial
      , device.model
      )
    }
  }

  return device
}

datautil.applyOwner = function(device, user) {
  device.using = !!device.owner && device.owner.email === user.email
  return device
}

datautil.normalize = function(device, user) {
  datautil.applyData(device)
  datautil.applyOwner(device, user)
  if (!device.present) {
    device.owner = null
  }
}

datautil.middleware = function() {
  return express.static(pathutil.root('node_modules/stf-devices-db/data/small'))
}