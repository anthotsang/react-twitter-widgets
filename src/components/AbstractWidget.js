import React from 'react'
import PropTypes from 'prop-types'
import { canUseDOM } from 'exenv'

export default class AbstractWidget extends React.Component {
  static propTypes = {
    ready: PropTypes.func.isRequired,
  };

  static removeChildren(node) {
    if (node) {
      while (node.firstChild) {
        node.removeChild(node.firstChild)
      }
    }
  }

  static removeChildrenExceptLast(node) {
    if (node) {
      while (node.childNodes.length > 1) {
        node.removeChild(node.firstChild)
      }
    }
  }

  componentDidMount() {
    this.willUnmount = false
    this.loadWidget()
  }

  componentDidUpdate() {
    this.loadWidget()
  }

  componentWillUnmount() {
    this.willUnmount = true
  }

  loadWidget = () => {
    if (canUseDOM) {
      const $script = require('scriptjs') // eslint-disable-line global-require
      $script('https://platform.twitter.com/widgets.js', 'twitter-widgets', () => {
        if (this.willUnmount) {
          return
        }
        if (!window.twttr) {
          // If the script tag fails to load, scriptjs.ready() will still trigger.
          // Let's avoid the JS exceptions when that happens.
          console.error('Failure to load window.twttr, aborting load.') // eslint-disable-line no-console
          return
        }

        // Delete existing
        AbstractWidget.removeChildren(this.widgetWrapper)

        // Create widget
        this.props.ready(window.twttr, this.widgetWrapper, this.done)
      })
    }
  }

  done = () => {
    if (this.willUnmount) {
      AbstractWidget.removeChildrenExceptLast(this.widgetWrapper)
    }
  }

  render() {
    return React.createElement('div', {
      ref: (c) => {
        this.widgetWrapper = c
      },
    })
  }
}
