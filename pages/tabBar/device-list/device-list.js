function inArray(arr, key, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === val) {
      return i
    }
  }
  return -1
}

Page({
  data: {
    value: '',
    placeholder: '',
    devices: [],
    connected: false,
    searchDevices: []
  },
  onLoad(query) {
   this.initPage(query)
   this.openBluetoothAdapter()
  },
  initPage(query){
    let placeholder = '搜索'
    this.setData({
      placeholder
    })
  },
  search(e) {
    const value = e.detail.value
    const _this = this
    this.setData({
      value
    })
    let devicesData = this.data.devices
    let searchData = []
    for (let i = 0; i < devicesData.length; i++) {
      let item = devicesData[i]
      let name = item.name
      if (name.search(value) != -1) {
        searchData.push(item)
      }
    }
    this.setData({"searchDevices": searchData})
  },
  goDetail(e) {
    const ds = e.currentTarget.dataset
    const deviceId = ds.deviceId
    const name = ds.name
    wx.showLoading()
    wx.createBLEConnection({
      deviceId,
      success: () => {
        this.setData({
          connected: true,
          name,
          deviceId,
        })
        wx.navigateTo({
          url: `/pages/subPages/device-detail/device-detail?deviceId=${deviceId}`
        })
      },
      complete() {
        wx.hideLoading()
      }
    })
  },
  openBluetoothAdapter() {
    wx.openBluetoothAdapter({
      success: (res) => {
        this.startBluetoothDevicesDiscovery()
      },
      fail: (res) => {
        if (res.errCode === 10001) {
          wx.showModal({
            title: '错误',
            content: '未找到蓝牙设备, 请打开蓝牙后重试。',
            showCancel: false
          })
          wx.onBluetoothAdapterStateChange(function (res) {
            if (res && res.available) {
              this.startBluetoothDevicesDiscovery()
            }
          })
        }
      }
    })
  },
  startBluetoothDevicesDiscovery() {
    if (this._discoveryStarted) {
      return
    }
    this._discoveryStarted = true
    wx.startBluetoothDevicesDiscovery({
      allowDuplicatesKey: true,
      success: (res) => {
        this.onBluetoothDeviceFound()
      },
    })
  },
  onBluetoothDeviceFound() {
    wx.onBluetoothDeviceFound((res) => {
      res.devices.forEach(device => {
        if (!device.name && !device.localName) {
          return
        }
        const foundDevices = this.data.devices
        const idx = inArray(foundDevices, 'deviceId', device.deviceId)
        const data = {}
        if (idx === -1) {
          data[`devices[${foundDevices.length}]`] = device
        } else {
          data[`devices[${idx}]`] = device
        }
        this.setData(data)
      })
    })
  }
})