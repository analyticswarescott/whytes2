import React, { Component } from 'react';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import Content from './Content'
import Data    from './Data'
import Sidebar from './Sidebar'
import Topbar  from './Topbar'

import dataset from '../config.js'


import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

darkBaseTheme.palette = {
    ...darkBaseTheme.palette,
    primary1Color: '#ccc',
    primary2Color: '#ccc',
    // primary3Color: '#ccc',
    // accent1Color: pinkA200,
    // accent2Color: pinkA400,
    // accent3Color: pinkA100,
    // textColor: fullWhite,
    // secondaryTextColor: fade(fullWhite, 0.7),
    alternateTextColor: '#303030',
    canvasColor: '#1c1f28',
    // borderColor: fade(fullWhite, 0.3),
    // disabledColor: fade(fullWhite, 0.3),
    // pickerHeaderColor: fade(fullWhite, 0.12),
    // clockCircleColor: fade(fullWhite, 0.12),
  }

const theme = getMuiTheme(darkBaseTheme)


class App extends Component {

    showSidebar   = () => window.innerWidth > 0/*1400*/
    toggleSidebar = () => this.setState({ showSidebar: !this.state.showSidebar})

    componentWillMount() {
        this.state = { showSidebar: this.showSidebar() }
    }

    render() {

        console.log(this.state.showSidebar)
        return (
        <MuiThemeProvider muiTheme={theme}>
            <Data
                url={dataset.url}
                dimensions={dataset.dimensions}
                measures={dataset.measures}
                aggregations={dataset.aggregations}
                order={dataset.order}
                preprocessor={dataset.preprocessor}
            >
                <Sidebar isOpen={this.state.showSidebar} toggleSidebarHandler={this.toggleSidebar}/>
                <Content indent={this.state.showSidebar} >
                    {React.cloneElement(this.props.children)}
                </Content>
            </Data>
        </MuiThemeProvider>
        )
    }
}

export default App
