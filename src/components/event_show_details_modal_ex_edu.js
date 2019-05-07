import React, { Component } from 'react';
import { connect } from 'react-redux';
import { connectModal } from 'redux-modal';
import PropTypes from 'prop-types';
import moment from 'moment';
import axios from 'axios';
import Cookies from 'universal-cookie';
import { Button, Row, Col, Image, Card, Modal, ListGroup } from 'react-bootstrap';
import ImagePreviewModal from './image_preview_modal';
import EventPermalinkModal from './event_permalink_modal';

import * as actions from '../actions';

import { API_ROOT_URL, IMAGE_PATH, ROOT_PATH  } from '../client_config';

const cookies = new Cookies();

const excludeAuxDataSources = ['framegrabber']

class EventShowDetailsModal extends Component {

  constructor (props) {
    super(props);

    this.state = { event: {} }

    this.initEvent = this.initEvent.bind(this);
    this.handleEventUpdate = this.handleEventUpdate.bind(this);
    this.handleImagePreviewModal = this.handleImagePreviewModal.bind(this);

  }

  static propTypes = {
    event: PropTypes.object.isRequired,
    handleHide: PropTypes.func.isRequired,
    handleUpdateEvent: PropTypes.func.isRequired
  };

  componentDidMount() {
    this.initEvent()
  }

  componentWillUnmount() {
  }

  async initEvent() {
    try {
      const result = await axios.get(`${API_ROOT_URL}/api/v1/event_exports/${this.props.event.id}`,
        {
          headers: {
          authorization: cookies.get('token')
          }
        }      
      )

      this.setState({event: result.data})
    }
    catch (error) {
      console.log(error);
    }
  }

  handleMissingImage(ev) {
    ev.target.src = `${ROOT_PATH}images/noimage.jpeg`
  }

  handleImagePreviewModal(source, filepath) {
    this.props.showModal('imagePreview', { name: source, filepath: filepath })
  }

  handleEventPermalinkModal() {
    this.props.showModal('eventPermalink', { event: this.state.event, handleUpdateEvent: this.handleEventUpdate });
  }

  async handleEventUpdate(event_id, event_value, event_free_text, event_options, event_ts) {
    this.props.handleUpdateEvent(event_id, event_value, event_free_text, event_options, event_ts)
    try {
      await this.initEvent()
    }
    catch(error) {
      console.log(error);
    }
  }

  renderImage(source, filepath) {
    return (
      <Card border="secondary" id={`image_${source}`}>
        <Card.Body className="data-card-body">
          <Image  fluid onError={this.handleMissingImage} src={filepath} onClick={ () => this.handleImagePreviewModal(source, filepath)} />
          <div>{source}</div>
        </Card.Body>
      </Card>
    )
  }

  renderImageryCard() {
    if(this.state.event.aux_data) { 
      let frameGrabberData = this.state.event.aux_data.filter(aux_data => aux_data.data_source == 'framegrabber')
      let tmpData = []

      if(frameGrabberData.length > 0) {
        for (let i = 0; i < frameGrabberData[0].data_array.length; i+=2) {
    
          tmpData.push({source: frameGrabberData[0].data_array[i].data_value, filepath: API_ROOT_URL + IMAGE_PATH + frameGrabberData[0].data_array[i+1].data_value} )
        }

        return (
          <Row>
            {
              tmpData.map((camera) => {
                return (
                  <Col key={camera.source} xs={12} sm={6} md={6} lg={4}>
                    {this.renderImage(camera.source, camera.filepath)}
                  </Col>
                )
              })
            }
          </Row>
        )
      }
    }
  }

  renderEventCard() {
    if(this.state.event) {
      return (
        <Card border="secondary">
          <Card.Header className="data-card-header">Event Details</Card.Header>
          <Card.Body className="data-card-body">
            <div style={{paddingLeft: "10px"}}>
              <div key={"event_ts"}><span>Time:</span> <span style={{wordWrap:'break-word'}} >{this.state.event.ts}</span><br/></div>
              <div key={"event_author"}><span>User:</span> <span style={{wordWrap:'break-word'}} >{this.state.event.event_author}</span><br/></div>
            </div>
          </Card.Body>
        </Card>
      )
    }
  }

  renderEventOptionsCard() {

    if(this.state.event && this.state.event.event_options && this.state.event.event_options.length > 0) {

      let event_seatube_permalink = false

      let return_event_options = this.state.event.event_options.reduce((filtered, event_option, index) => {
        if(event_option.event_option_name !== 'event_comment') {
          if (this.state.event.event_value === "EDU" && event_option.event_option_name === 'seatube_permalink') {
            event_seatube_permalink = true
            if(this.props.roles.includes("admin") || this.props.roles.includes("event_manager") || this.props.roles.includes("event_loggerr")) {
              if( event_option.event_option_value !== '') {
                filtered.push(<span key={`event_option_${index}`}>{event_option.event_option_name}: <a target="_blank" href={this.state.event.event_options[index].event_option_value}>{this.state.event.event_options[index].event_option_value}</a> (<span className="text-primary" onClick={() => this.handleEventPermalinkModal()}>Edit</span>)<br/></span>)
              }
              else {
                filtered.push(<span key={`event_option_${index}`}>{event_option.event_option_name}: (<span className="text-primary" onClick={() => this.handleEventPermalinkModal()}>Add</span>)<br/></span>)
              }
            }
          }
          else {
              filtered.push(<div key={`event_option_${index}`}><span>{event_option.event_option_name}:</span> <span style={{wordWrap:'break-word'}} >{event_option.event_option_value}</span><br/></div>);
          }
        }

        return filtered
      },[])

      if(this.state.event.event_value === "EDU" && !event_seatube_permalink) {
        if(this.props.roles.includes("admin") || this.props.roles.includes("event_manager") || this.props.roles.includes("event_loggerr")) {
          return_event_options.push(<span key={`event_option_${return_event_options.length}`}>seatube_permalink: (<span className="text-primary" onClick={() => this.handleEventPermalinkModal()}>Add</span>)<br/></span>)
        }
        else {
          return_event_options.push(<span key={`event_option_${return_event_options.length}`}>seatube_permalink:<br/></span>) 
        }
      }

      return (return_event_options.length > 0)? (
        <Card border="secondary">
          <Card.Header className="data-card-header">Event Options</Card.Header>
          <Card.Body className="data-card-body">
            <div style={{paddingLeft: "10px"}}>
              {return_event_options}
            </div>
          </Card.Body>
        </Card>
      ) : null
    }
  }

  renderAuxDataCard() {

    if(this.state.event && this.state.event.aux_data) {
      let return_aux_data = this.state.event.aux_data.reduce((filtered, aux_data, index) => {
        if(!excludeAuxDataSources.includes(aux_data.data_source)) {
          let aux_data_points = aux_data.data_array.map((data, index) => {
            return(<div key={`${aux_data.data_source}_data_point_${index}`}><span>{data.data_name}:</span> <span style={{wordWrap:'break-word'}} >{data.data_value} {data.data_uom}</span><br/></div>)
          })

          if(aux_data_points.length > 0) {
            filtered.push(
              <Card key={`${aux_data.data_source}`} border="secondary">
                <Card.Header className="data-card-header">{aux_data.data_source}</Card.Header>
                <Card.Body className="data-card-body">
                  <div style={{paddingLeft: "10px"}}>
                    {aux_data_points}
                  </div>
                </Card.Body>
              </Card>
            )
          }
        }

        return filtered
      },[])

      return return_aux_data
    }

    return null
  }

  render() {
    const { show, handleHide } = this.props

    const event_free_text_card = (this.state.event.event_free_text)? (<Card border="secondary"><Card.Body className="data-card-body">Text: {this.state.event.event_free_text}</Card.Body></Card>) : null;

    if(this.state.event.event_options) {

      const event_comment = (this.state.event.event_options) ? this.state.event.event_options.find((event_option) => (event_option.event_option_name === 'event_comment' && event_option.event_option_value.length > 0)) : null
      const event_comment_card = (event_comment) ? (
        <Card border="secondary">
          <Card.Body className="data-card-body">
            Comment: {event_comment.event_option_value}
          </Card.Body>
        </Card>
      ) : null;

      return (
        <Modal size="lg" show={show} onHide={handleHide}>
        <ImagePreviewModal />
        <EventPermalinkModal />
          <Modal.Header closeButton>
            <Modal.Title>{`Event Details: ${this.state.event.event_value}`}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col xs={12}>
                {this.renderImageryCard()}
              </Col>
            </Row>
            <Row style={{paddingTop: "8px"}}>
              <Col xs={12} sm={6} md={4}>
                {this.renderEventCard()}
              </Col>
              <Col xs={12} sm={6} md={4}>
                {this.renderEventOptionsCard()}
              </Col>
              <Col xs={12} sm={6} md={4}>
                {this.renderAuxDataCard()}
              </Col>
            </Row>
            <Row style={{paddingTop: "8px"}}>
              <Col xs={12}>
                {event_free_text_card}
              </Col>
            </Row>
            <Row style={{paddingTop: "8px"}}>
              <Col xs={12}>
                {event_comment_card}
              </Col>
            </Row>
          </Modal.Body>
        </Modal>
      );
    } else {
      return (
        <Modal size="lg" show={show} onHide={handleHide}>
          <Modal.Header closeButton>
            <Modal.Title>Event Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Loading...
          </Modal.Body>
        </Modal>
      );
    }
  }
}

function mapStateToProps(state) {

  return {
    roles: state.user.profile.roles,
  }

}

EventShowDetailsModal = connect(
  mapStateToProps, actions
)(EventShowDetailsModal)

export default connectModal({ name: 'eventShowDetails', destroyOnHide: true })(EventShowDetailsModal)
