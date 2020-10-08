import React, { Component } from 'react'
import PropTypes from 'prop-types'

const getFreestar = () => {
  return new Promise((resolve, reject) => {
    const maxTries = 10
    let retryCount = 0
    const waitForFreestarReady = setInterval(() => {
      if (window.freestar && window.googletag && window.googletag.apiReady) {
        clearInterval(waitForFreestarReady)
        resolve(window.freestar)
      } else if (retryCount === maxTries) {
        clearInterval(waitForFreestarReady)
        reject(`freestar NOT ready after ${maxTries} tries`)
      } else {
        retryCount++
      }
    }, 10)
  })
}

class FreestarAdSlot extends Component {
  componentDidMount () {
    const { publisher } = this.props
    const qa = window.location.search.indexOf('fsdebug') > -1 ? '/qa' : ''
    const url = `https://a.pub.network/${publisher}${qa}/pubfig.min.js`

    const script = document.createElement('script')
    script.src = url
    script.async = true
    document.body.appendChild(script)
    script.onload = () => {
      window.freestar.hitTime = Date.now()
      window.freestar.queue = []
      window.freestar.config = {
        enabled_slots: []
      }
      this.newAdSlots()
    }
  }

  componentWillUnmount () {
    const { placementName, onDeleteAdSlotsHook } = this.props
    getFreestar().then(freestar => {
      freestar.deleteAdSlots({ placementName })
      onDeleteAdSlotsHook(placementName)
    })
  }

  newAdSlots = () => {
    const { placementName, onNewAdSlotsHook, channel, targeting } = this.props
    getFreestar().then(freestar => {
      freestar.newAdSlots({
        slotId: placementName,
        placementName,
        targeting
      }, channel)
      onNewAdSlotsHook(placementName)
    })
  }

  classes = () => {
    const { classList } = this.props
    return (classList) ? classList.join(' ') : ''
  }

  render() {
    const { placementName } = this.props
    return (
      <div>
        <div className={this.classes()} id={placementName}></div>
      </div>
    )
  }
}

FreestarAdSlot.propTypes = {
  publisher: PropTypes.string.isRequired,
  placementName: PropTypes.string.isRequired,
  targeting: PropTypes.object,
  channel: PropTypes.string,
  classList: PropTypes.array,
  onNewAdSlotsHook: PropTypes.func,
  onDeleteAdSlotsHook: PropTypes.func
}

FreestarAdSlot.defaultProps = {
  publisher: '',
  placementName: '',
  targeting: {},
  channel: null,
  classList: [],
  onNewAdSlotsHook: () => {},
  onDeleteAdSlotsHook: () => {}
}

export default FreestarAdSlot
