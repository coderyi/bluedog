Page({
  data: {
    allService: {},
    allServiceID: [],
    deviceId: ''
  },

  onLoad(query){
    const deviceId = query.deviceId
    this.setData({"deviceId": deviceId})
    this.getBLEDeviceServices(deviceId)
  },
  getBLEDeviceServices(deviceId) {
    wx.getBLEDeviceServices({
      deviceId,
      success: (res) => {
        for (let i = 0; i < res.services.length; i++) {
          if (res.services[i].isPrimary) {
            this.getBLEDeviceCharacteristics(deviceId, res.services[i].uuid, res.services[i])
          }
        }
      }
    })
  },
  getBLEDeviceCharacteristics(deviceId, serviceId, service) {
    wx.getBLEDeviceCharacteristics({
      deviceId,
      serviceId,
      success: (res) => {
        var allData = this.data.allService
        allData[serviceId] = {
          "serviceId": serviceId,
          "service": service,
          "characteristics": res.characteristics
        }
        this.setData({"allService": allData, "allServiceID": Object.keys(allData)})
      },
      fail(res) {
        console.error('getBLEDeviceCharacteristics', res)
      }
    })

  }
})