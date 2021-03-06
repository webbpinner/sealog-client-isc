import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom';
import moment from 'moment';
import { connect } from 'react-redux';
import Cookies from 'universal-cookie';
import { Button, Row, Col, Card, ListGroup, Dropdown, Pagination, Tooltip, OverlayTrigger } from 'react-bootstrap';
import axios from 'axios';
import EventFilterForm from './event_filter_form';
import EventCommentModal from './event_comment_modal';
import EventShowDetailsModal from './event_show_details_modal_ex_edu';
import LoweringDropdown from './lowering_dropdown';
import LoweringModeDropdown from './lowering_mode_dropdown';
import * as actions from '../actions';
import { ROOT_PATH, API_ROOT_URL } from '../client_config';

let fileDownload = require('js-file-download');

const dateFormat = "YYYYMMDD"
const timeFormat = "HHmm"

const maxEventsPerPage = 15

class LoweringReview extends Component {

  constructor (props) {
    super(props);

    this.state = {
      hideASNAP: true,
      activePage: 1
    }

    this.handleEventUpdate = this.handleEventUpdate.bind(this);
    this.handlePageSelect = this.handlePageSelect.bind(this);
    this.updateEventFilter = this.updateEventFilter.bind(this);
    this.handleLoweringSelect = this.handleLoweringSelect.bind(this);
    this.handleLoweringModeSelect = this.handleLoweringModeSelect.bind(this);

  }

  componentDidMount(){
    if(!this.props.lowering.id || this.props.lowering.id != this.props.match.params.id || this.props.event.events.length == 0) {
      // console.log("initLoweringReplay", this.props.match.params.id)
      this.props.initLoweringReplay(this.props.match.params.id, this.state.hideASNAP);
    }

    // if(!this.props.cruise.id || this.props.lowering.id != this.props.match.params.id){
    this.props.initCruiseFromLowering(this.props.match.params.id);
    // }
  }

  componentDidUpdate() {
  }

  componentWillUnmount(){
  }

  updateEventFilter(filter = {}) {
    this.setState({ activePage: 1 });
    this.props.updateEventFilterForm(filter);
    this.props.eventUpdateLoweringReplay(this.props.match.params.id, this.state.hideASNAP)
  }

  handlePageSelect(eventKey) {
    this.setState({activePage: eventKey});
  }

  handleEventCommentModal(event) {
    this.props.showModal('eventComment', { event: event, handleUpdateEvent: this.handleEventUpdate });
  }

  async handleEventUpdate(event_id, event_value, event_free_text, event_options, event_ts) {
    const response = await this.props.updateEvent(event_id, event_value, event_free_text, event_options, event_ts)
    if(response.response.status == 204) {
      this.props.updateLoweringReplayEvent(event_id);
    }
  }

  handleEventShowDetailsModal(event) {
    this.props.showModal('eventShowDetails', { event: event, handleUpdateEvent: this.props.updateEvent });
  }

  fetchEventAuxData() {

    const cookies = new Cookies();
    let startTS = (this.props.event.eventFilter.startTS)? `startTS=${this.props.event.eventFilter.startTS}` : ''
    let stopTS = (this.props.event.eventFilter.stopTS)? `&stopTS=${this.props.event.eventFilter.stopTS}` : ''
    let value = (this.props.event.eventFilter.value)? `&value=${this.props.event.eventFilter.value.split(',').join("&value=")}` : ''
    value = (this.state.hideASNAP)? `&value=!ASNAP${value}` : value;
    let author = (this.props.event.eventFilter.author)? `&author=${this.props.event.eventFilter.author.split(',').join("&author=")}` : ''
    let freetext = (this.props.event.eventFilter.freetext)? `&freetext=${this.props.event.eventFilter.freetext}` : ''
    let datasource = (this.props.event.eventFilter.datasource)? `&datasource=${this.props.event.eventFilter.datasource}` : ''

    return axios.get(`${API_ROOT_URL}/api/v1/event_aux_data/bylowering/${this.props.lowering.id}?${startTS}${stopTS}${value}${author}${freetext}${datasource}`,
      {
        headers: {
          authorization: cookies.get('token')
        }
      }).then((response) => {
        return response.data
      }).catch((error)=>{
        if(error.response.data.statusCode == 404){
          return []
        } else {
          console.log(error.response);
          return []
        }
      }
    );
  }

  fetchEventsWithAuxData(format = 'json') {

    const cookies = new Cookies();
    format = `format=${format}`
    let startTS = (this.props.event.eventFilter.startTS)? `&startTS=${this.props.event.eventFilter.startTS}` : ''
    let stopTS = (this.props.event.eventFilter.stopTS)? `&stopTS=${this.props.event.eventFilter.stopTS}` : ''
    let value = (this.props.event.eventFilter.value)? `&value=${this.props.event.eventFilter.value.split(',').join("&value=")}` : ''
    value = (this.state.hideASNAP)? `&value=!ASNAP${value}` : value;
    let author = (this.props.event.eventFilter.author)? `&author=${this.props.event.eventFilter.author.split(',').join("&author=")}` : ''
    let freetext = (this.props.event.eventFilter.freetext)? `&freetext=${this.props.event.eventFilter.freetext}` : ''
    let datasource = (this.props.event.eventFilter.datasource)? `&datasource=${this.props.event.eventFilter.datasource}` : ''

    return axios.get(`${API_ROOT_URL}/api/v1/event_exports/bylowering/${this.props.lowering.id}?${format}${startTS}${stopTS}${value}${author}${freetext}${datasource}`,
      {
        headers: {
          authorization: cookies.get('token')
        }
      }).then((response) => {
        return response.data
      }).catch((error)=>{
        if(error.response.data.statusCode == 404){
          return []
        } else {
          console.log(error.response);
          return []
        }
      }
    );
  }

  fetchEvents(format = 'json') {

    const cookies = new Cookies();
    format = `format=${format}`
    let startTS = (this.props.event.eventFilter.startTS)? `&startTS=${this.props.event.eventFilter.startTS}` : ''
    let stopTS = (this.props.event.eventFilter.stopTS)? `&stopTS=${this.props.event.eventFilter.stopTS}` : ''
    let value = (this.props.event.eventFilter.value)? `&value=${this.props.event.eventFilter.value.split(',').join("&value=")}` : ''
    value = (this.state.hideASNAP)? `&value=!ASNAP${value}` : value;
    let author = (this.props.event.eventFilter.author)? `&author=${this.props.event.eventFilter.author.split(',').join("&author=")}` : ''
    let freetext = (this.props.event.eventFilter.freetext)? `&freetext=${this.props.event.eventFilter.freetext}` : ''
    let datasource = (this.props.event.eventFilter.datasource)? `&datasource=${this.props.event.eventFilter.datasource}` : ''

    return axios.get(`${API_ROOT_URL}/api/v1/events/bylowering/${this.props.lowering.id}?${format}${startTS}${stopTS}${value}${author}${freetext}${datasource}`,
      {
        headers: {
          authorization: cookies.get('token')
        }
      }).then((response) => {
        return response.data
      }).catch((error)=>{
        if(error.response.data.statusCode == 404){
          return []
        } else {
          console.log(error.response);
          return []
        }
      }
    );
  }

  exportEventsWithAuxDataToCSV() {
    this.fetchEventsWithAuxData('csv').then((results) => {
      let prefix = moment.utc(this.props.event.events[0].ts).format(dateFormat + "_" + timeFormat)
      fileDownload(results, `${prefix}.sealog_export.csv`);
    }).catch((error) => {
      console.log(error)
    })
  }

  exportEventsToCSV() {
    this.fetchEvents('csv').then((results) => {
      let prefix = moment.utc(this.props.event.events[0].ts).format(dateFormat + "_" + timeFormat)
      fileDownload(results, `${prefix}.sealog_eventExport.csv`);
    }).catch((error) => {
      console.log(error)
    })
  }

  exportEventsWithAuxDataToJSON() {

    this.fetchEventsWithAuxData().then((results) => {
      let prefix = moment.utc(this.props.event.events[0].ts).format(dateFormat + "_" + timeFormat)
      fileDownload(JSON.stringify(results, null, 2), `${prefix}.sealog_export.json`);
    }).catch((error) => {
      console.log(error)
    })
  }

  exportEventsToJSON() {

    this.fetchEvents().then((results) => {
      let prefix = moment.utc(this.props.event.events[0].ts).format(dateFormat + "_" + timeFormat)
      fileDownload(JSON.stringify(results, null, 2), `${prefix}.sealog_eventExport.json`);
    }).catch((error) => {
      console.log(error)
    })
  }

  exportAuxDataToJSON() {

    this.fetchEventAuxData().then((results) => {
      let prefix = moment.utc(this.props.event.events[0].ts).format(dateFormat + "_" + timeFormat)
      fileDownload(JSON.stringify(results, null, 2), `${prefix}.sealog_auxDataExport.json`);
    }).catch((error) => {
      console.log(error)
    })
  }

  handleLoweringSelect(id) {
    this.props.initLoweringReplay(id, this.state.hideASNAP);
    this.props.initCruiseFromLowering(id);
    this.setState({activePage: 1})
  }

  handleLoweringModeSelect(mode) {
    if(mode === "Review") {
      this.props.gotoLoweringReview(this.props.match.params.id)
    } else if (mode === "Gallery") {
      this.props.gotoLoweringGallery(this.props.match.params.id)
    } else if (mode === "Replay") {
      this.props.gotoLoweringReplay(this.props.match.params.id)
    }
  }

  toggleASNAP() {
    this.props.eventUpdateLoweringReplay(this.props.lowering.id, !this.state.hideASNAP)
    this.setState( prevState => ({hideASNAP: !prevState.hideASNAP, activePage: 1}))
  }

  renderEventListHeader() {

    const Label = "Filtered Events"
    const exportTooltip = (<Tooltip id="deleteTooltip">Export these events</Tooltip>)
    const toggleASNAPTooltip = (<Tooltip id="toggleASNAPTooltip">Show/Hide ASNAP Events</Tooltip>)

    const ASNAPToggleIcon = (this.state.hideASNAP)? "Show ASNAP" : "Hide ASNAP"
    const ASNAPToggle = (<span disabled={this.props.event.fetching} style={{ marginRight: "10px" }} onClick={() => this.toggleASNAP()}>{ASNAPToggleIcon}</span>)

    return (
      <div>
        { Label }
        <span className="float-right">
          {ASNAPToggle}
          <Dropdown as={'span'} disabled={this.props.event.fetching} id="dropdown-download">
            <Dropdown.Toggle as={'span'}><OverlayTrigger placement="top" overlay={exportTooltip}><FontAwesomeIcon icon='download' fixedWidth/></OverlayTrigger></Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Header className="text-warning" key="toJSONHeader">JSON format</Dropdown.Header>
              <Dropdown.Item key="toJSONAll" onClick={ () => this.exportEventsWithAuxDataToJSON()}>Events w/aux data</Dropdown.Item>
              <Dropdown.Item key="toJSONEvents" onClick={ () => this.exportEventsToJSON()}>Events Only</Dropdown.Item>
              <Dropdown.Item key="toJSONAuxData" onClick={ () => this.exportAuxDataToJSON()}>Aux Data Only</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Header className="text-warning" key="toCSVHeader">CSV format</Dropdown.Header>
              <Dropdown.Item key="toCSVAll" onClick={ () => this.exportEventsWithAuxDataToCSV()}>Events w/aux data</Dropdown.Item>
              <Dropdown.Item key="toCSVEvents" onClick={ () => this.exportEventsToCSV()}>Events Only</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </span>
      </div>
    );
  }

  renderEventCard() {

    if (!this.props.event.events) {
      return (
        <Card>
          <Card.Header>{ this.renderEventListHeader() }</Card.Header>
          <Card.Body>Loading...</Card.Body>
        </Card>
      )
    }

    return (
      <Card>
        <Card.Header>{ this.renderEventListHeader() }</Card.Header>
        <ListGroup>
          {this.renderEvents()}
        </ListGroup>
      </Card>
    );
  }


  renderEvents() {

    if(this.props.event.events && this.props.event.events.length > 0){

      let eventArray = []

      for (let i = 0; i < this.props.event.events.length; i++) {

        let event = this.props.event.events[i]
        
        let comment_exists = false;
        let edu_event = (event.event_value === "EDU")? true : false;
        let seatube_exists = false;
        let seatube_permalink = '';
        let youtube_material = false;

        let eventOptionsArray = event.event_options.reduce((filtered, option) => {
          if(option.event_option_name === 'event_comment') {
            comment_exists = (option.event_option_value !== '')? true : false;
          } else if(edu_event && option.event_option_name == 'seatube_permalink') {
            seatube_exists = (option.event_option_value !== '')? true : false;
            seatube_permalink = option.event_option_value;
          } else if(edu_event && option.event_option_name === 'youtube_material') {
            youtube_material = (option.event_option_value === 'Yes')? true : false;
          } else {
            filtered.push(`${option.event_option_name}: \"${option.event_option_value}\"`);
          }
          return filtered
        },[])
        
        if (event.event_free_text) {
          eventOptionsArray.push(`free_text: \"${event.event_free_text}\"`)
        } 

        let eventOptions = (eventOptionsArray.length > 0)? '--> ' + eventOptionsArray.join(', '): ''
     // let commentIcon = (comment_exists)? <FontAwesomeIcon onClick={() => this.handleEventCommentModal(event)} icon='comment' fixedWidth transform="grow-4"/> : <span onClick={() => this.handleEventCommentModal(event)} className="fa-layers fa-fw"><FontAwesomeIcon icon='comment' fixedWidth transform="grow-4"/><FontAwesomeIcon className="text-secondary" icon='plus' fixedWidth inverse transform="shrink-4"/></span>
        let commentIcon = (comment_exists)? <FontAwesomeIcon onClick={() => this.handleEventCommentModal(event)} icon='comment' fixedWidth transform="grow-4"/> : <span onClick={() => this.handleEventCommentModal(event)} className="fa-layers fa-fw"><FontAwesomeIcon icon='comment' fixedWidth transform="grow-4"/><FontAwesomeIcon className="text-secondary" icon='plus' fixedWidth inverse transform="shrink-4"/></span>
     // let commentTooltip = (comment_exists)? (<OverlayTrigger placement="left" overlay={<Tooltip id={`commentTooltip_${event.id}`}>Edit/View Comment</Tooltip>}>{commentIcon}</OverlayTrigger>) : (<OverlayTrigger placement="left" overlay={<Tooltip id={`commentTooltip_${event.id}`}>Add Comment</Tooltip>}>{commentIcon}</OverlayTrigger>)
        let commentTooltip = (comment_exists)? (<OverlayTrigger placement="left" overlay={<Tooltip id={`commentTooltip_${event.id}`}>Edit/View Comment</Tooltip>}>{commentIcon}</OverlayTrigger>) : (<OverlayTrigger placement="left" overlay={<Tooltip id={`commentTooltip_${event.id}`}>Add Comment</Tooltip>}>{commentIcon}</OverlayTrigger>)

        let permalinkTooltip = null
        let youtubeTooltip = null

        if(edu_event) {
          permalinkTooltip = (seatube_permalink)? (<OverlayTrigger placement="top" overlay={<Tooltip id={`commentTooltip_${event.id}`}>Open Seatube Permalink</Tooltip>}><a href={seatube_permalink} target="_blank"><FontAwesomeIcon icon='link' fixedWidth transform="grow-4"/></a></OverlayTrigger>) : null
          youtubeTooltip = (youtube_material)? (<OverlayTrigger placement="top" overlay={<Tooltip id={`commentTooltip_${event.id}`}>This is YouTube material</Tooltip>}><FontAwesomeIcon icon={['fab', 'youtube']} fixedWidth/></OverlayTrigger>) : null
        }

     // eventArray.push(<ListGroup.Item className="event-list-item" eventKey={event.id} key={event.id}><span onClick={() => this.handleEventShowDetailsModal(event)}>{event.ts} {`<${event.event_author}>`}: {event.event_value} {eventOptions}</span><span className="float-right">{commentTooltip}</span></ListGroup.Item>);
        eventArray.push(<ListGroup.Item className="event-list-item" key={event.id}><span onClick={() => this.handleEventShowDetailsModal(event)}>{event.ts} {`<${event.event_author}>`}: {event.event_value} {eventOptions}</span><span className="float-right">{commentTooltip} {permalinkTooltip} {youtubeTooltip} </span></ListGroup.Item>);
      }
      return eventArray
    }

    return (<ListGroup.Item key="noEvents" >No events found</ListGroup.Item>)
  }

  renderPagination() {

    if(!this.props.event.fetching && this.props.event.events.length > maxEventsPerPage) {
      let eventCount = this.props.event.events.length
      let last = Math.ceil(eventCount/maxEventsPerPage);
      let delta = 2
      let left = this.state.activePage - delta
      let right = this.state.activePage + delta + 1
      let range = []
      let rangeWithDots = []
      let l = null

      for (let i = 1; i <= last; i++) {
        if (i == 1 || i == last || i >= left && i < right) {
            range.push(i);
        }
      }

      for (let i of range) {
        if (l) {
          if (i - l === 2) {
            rangeWithDots.push(<Pagination.Item key={l + 1} active={(this.state.activePage === l+1)} onClick={() => this.setState({activePage: (l + 1)})}>{l + 1}</Pagination.Item>)
          } else if (i - l !== 1) {
            rangeWithDots.push(<Pagination.Ellipsis key={`ellipsis_${i}`} />);
          }
        }
        rangeWithDots.push(<Pagination.Item key={i} active={(this.state.activePage === i)} onClick={() => this.setState({activePage: i})}>{i}</Pagination.Item>);
        l = i;
      }

      return (
        <Pagination style={{marginTop: "8px"}}>
          <Pagination.First onClick={() => this.setState({activePage: 1})} />
          <Pagination.Prev onClick={() => { if(this.state.activePage > 1) { this.setState(prevState => ({ activePage: prevState.activePage-1}))}}} />
          {rangeWithDots}
          <Pagination.Next onClick={() => { if(this.state.activePage < last) { this.setState(prevState => ({ activePage: prevState.activePage+1}))}}} />
          <Pagination.Last onClick={() => this.setState({activePage: last})} />
        </Pagination>
      )
    }
  }

  render(){

    const cruise_id = (this.props.cruise.cruise_id)? this.props.cruise.cruise_id : "Loading..."
    const lowering_id = (this.props.lowering.lowering_id)? this.props.lowering.lowering_id : "Loading..."

    return (
      <div>
        <EventCommentModal />
        <EventShowDetailsModal />
        <Row>
          <Col lg={12}>
            <span style={{paddingLeft: "8px"}}>
              <span onClick={() => this.props.gotoCruiseMenu()} className="text-warning">{cruise_id}</span>
              {' '}/{' '}
              <span><LoweringDropdown onClick={this.handleLoweringSelect} active_cruise={this.props.cruise} active_lowering={this.props.lowering}/></span>
              {' '}/{' '}
              <span><LoweringModeDropdown onClick={this.handleLoweringModeSelect} active_mode={"Review"} modes={["Gallery", "Replay"]}/></span>
            </span>
          </Col>
        </Row>
        <Row style={{paddingTop: "8px"}}>
          <Col sm={7} md={8} lg={9}>
            {this.renderEventCard()}
            {this.renderPagination()}
          </Col>
          <Col sm={5} md={4} lg={3}>
            <EventFilterForm disabled={this.props.event.fetching} hideASNAP={this.state.hideASNAP} handlePostSubmit={ this.updateEventFilter } minDate={this.props.lowering.start_ts} maxDate={this.props.lowering.stop_ts}/>
          </Col>
        </Row>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    roles: state.user.profile.roles,
    event: state.event,
    cruise: state.cruise.cruise,
    lowering: state.lowering.lowering
  }
}

export default connect(mapStateToProps, null)(LoweringReview);
