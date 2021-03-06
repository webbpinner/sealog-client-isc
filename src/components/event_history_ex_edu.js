import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { connect } from 'react-redux';
import { Button, ListGroup, Card, Tooltip, OverlayTrigger, Row, Col } from 'react-bootstrap';
import * as actions from '../actions';
import { Client } from 'nes/client';
import Cookies from 'universal-cookie';
import { WS_ROOT_URL } from '../client_config';

const cookies = new Cookies();

class EventHistory extends Component {

  constructor (props) {
    super(props);

    this.state = {
      hideASNAP: true,
      showEventHistory: true,
      showEventHistoryFullscreen: false
    }

    this.client = new Client(`${WS_ROOT_URL}`);
    this.connectToWS = this.connectToWS.bind(this);
  }

  componentDidMount() {
    this.props.fetchEventHistory();
    if(this.props.authenticated) {
      this.connectToWS()
    }
  }

  componentWillUnmount() {
    if(this.props.authenticated) {
      this.client.disconnect();
    }
  }

  componentDidUpdate() {
    // this.scrollToBottom();
  }

  async connectToWS() {

    try {
      const result = await this.client.connect()
      // {
      //   auth: {
      //     headers: {
      //       authorization: cookies.get('token')
      //     }
      //   }
      // })

      const updateHandler = (update, flags) => {
        if(!(this.state.hideASNAP && update.event_value === "ASNAP")) {
          this.props.updateEventHistory(update)
        }
      }

      const deleteHandler = (update, flags) => {
        this.props.fetchEventHistory(!this.state.hideASNAP)
      }

      this.client.subscribe('/ws/status/newEvents', updateHandler);
      this.client.subscribe('/ws/status/updateEvents', updateHandler);
      this.client.subscribe('/ws/status/deleteEvents', deleteHandler);

    } catch(error) {
      console.log(error);
      throw(error)
    }
  }

  handleEventShowDetailsModal(event) {
    this.props.showModal('eventShowDetails', { event: event, handleUpdateEvent: this.props.updateEvent });
  }

  handleEventCommentModal(event) {
    this.props.showModal('eventComment', { event: event, handleUpdateEvent: this.props.updateEvent });
  }

  renderEventHistoryHeader() {

    const Label = "Event History"
    const expandTooltip = (<Tooltip id="editTooltip">Expand this panel</Tooltip>)
    const compressTooltip = (<Tooltip id="editTooltip">Compress this panel</Tooltip>)
    const showTooltip = (<Tooltip id="editTooltip">Show this panel</Tooltip>)
    const hideTooltip = (<Tooltip id="editTooltip">Hide this panel</Tooltip>)
    const toggleASNAPTooltip = (<Tooltip id="toggleASNAPTooltip">Show/Hide ASNAP Events</Tooltip>)

    const ASNAPToggleIcon = (this.state.hideASNAP)? "Show ASNAP" : "Hide ASNAP"
    const ASNAPToggle = (<span style={{ marginRight: "10px" }} variant="secondary" size="sm" onClick={() => this.toggleASNAP()}>{ASNAPToggleIcon} </span>)


    if(this.state.showEventHistory) {

      if(this.state.showEventHistoryFullscreen) {
        return (
          <div>
            { Label }
            <div className="float-right">
              {ASNAPToggle}
              <OverlayTrigger placement="top" overlay={compressTooltip}><span style={{ marginRight: "10px" }} variant="secondary" size="sm" onClick={ () => this.handleHideEventHistoryFullscreen() }><FontAwesomeIcon icon='compress' fixedWidth/></span></OverlayTrigger>{' '}
              <OverlayTrigger placement="top" overlay={hideTooltip}><span variant="secondary" size="sm" onClick={ () => this.handleHideEventHistory() }><FontAwesomeIcon icon='eye-slash' fixedWidth/></span></OverlayTrigger>
            </div>
          </div>
        );
      }
      
      return (
        <div>
          { Label }
          <div className="float-right">
            {ASNAPToggle}
            <OverlayTrigger placement="top" overlay={expandTooltip}><span style={{ marginRight: "10px" }} variant="secondary" size="sm" onClick={ () => this.handleShowEventHistoryFullscreen() }><FontAwesomeIcon icon='expand' fixedWidth/></span></OverlayTrigger>{' '}
            <OverlayTrigger placement="top" overlay={hideTooltip}><span variant="secondary" size="sm" onClick={ () => this.handleHideEventHistory() }><FontAwesomeIcon icon='eye-slash' fixedWidth/></span></OverlayTrigger>
          </div>
        </div>
      );
    }

    return (
      <div>
        { Label }
        <div className="float-right">
          <OverlayTrigger placement="top" overlay={showTooltip}><span variant="secondary" size="sm" onClick={ () => this.handleShowEventHistory() }><FontAwesomeIcon icon='eye' fixedWidth/></span></OverlayTrigger>
        </div>
      </div>
    );
  }


  handleHideEventHistory() {
    this.setState({showEventHistory: false});
  }

  handleShowEventHistory() {
    this.setState({showEventHistory: true});
  }

  handleHideEventHistoryFullscreen() {
    this.setState({showEventHistoryFullscreen: false});
  }

  handleShowEventHistoryFullscreen() {
    this.setState({showEventHistoryFullscreen: true});
  }

  toggleASNAP() {
    this.setState( prevState => ({hideASNAP: !prevState.hideASNAP}))
    this.props.fetchEventHistory(this.state.hideASNAP);
  }

  renderEventHistory() {

    if(this.props.history && this.props.history.length > 0){

      let eventArray = []

      for (let i = 0; i < this.props.history.length; i++) {

        let event = this.props.history[i]
        
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

    return (<ListGroup.Item key="emptyHistory" >No events found</ListGroup.Item>)
  }

  render() {

    if (!this.props.history) {
      return (
        <Card>
          <Card.Header>{ this.renderEventHistoryHeader() }</Card.Header>
          <Card.Body>Loading...</Card.Body>
        </Card>
      )
    }

    if (this.state.showEventHistory) {
      if (this.state.showEventHistoryFullscreen) {
        return (
          <Card>
            <Card.Header>{ this.renderEventHistoryHeader() }</Card.Header>
            <ListGroup ref="eventHistory">
              {this.renderEventHistory()}
            </ListGroup>
          </Card>
        );
      }
    
      return (
        <Card>
          <Card.Header>{ this.renderEventHistoryHeader() }</Card.Header>
          <ListGroup className="eventHistory" ref="eventHistory">
            {this.renderEventHistory()}
          </ListGroup>
        </Card>
      );
    }

    return (
        <Card>
          <Card.Header>{ this.renderEventHistoryHeader() }</Card.Header>
        </Card>
    );
  }
}

function mapStateToProps(state) {

  return {
    authenticated: state.auth.authenticated,
    history: state.event_history.history,
  }
}

export default connect(mapStateToProps, actions)(EventHistory);
