import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Button, Form, Modal } from 'react-bootstrap';
import { connectModal } from 'redux-modal';
import { reduxForm, Field, initialize } from 'redux-form';
import * as actions from '../actions';

class EventPermalinkModal extends Component {

  constructor (props) {
    super(props);

    this.handleFormSubmit = this.handleFormSubmit.bind(this);
  }

  static propTypes = {
    event: PropTypes.object.isRequired,
    handleHide: PropTypes.func.isRequired,
    handleUpdateEvent: PropTypes.func.isRequired
  };

  handleFormSubmit({event_permalink = ''}) {

    let existing_permalink = false;
    let event_options = this.props.event.event_options = this.props.event.event_options.map(event_option => {
      if(event_option.event_option_name == 'seatube_permalink') {
        existing_permalink = true;
        return { event_option_name: 'seatube_permalink', event_option_value: event_permalink}
      } else {
        return event_option
      }
    })

    if(!existing_permalink) {
      event_options.push({ event_option_name: 'seatube_permalink', event_option_value: event_permalink})
    }

    this.props.handleUpdateEvent(this.props.event.id, this.props.event.event_value, this.props.event.event_free_text, event_options, this.props.event.ts);
    this.props.handleDestroy();
  }

  renderTextField({ input, label, placeholder, required, meta: { touched, error } }) {
    let requiredField = (required)? <span className='text-danger'> *</span> : ''
    let placeholder_txt = (placeholder)? placeholder: label

    return (
      <Form.Group>
        <Form.Label>{label}{requiredField}</Form.Label>
        <Form.Control type="text" {...input} placeholder={placeholder_txt} isInvalid={touched && error}/>
        <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
      </Form.Group>
    )
  }

  render() {
    const { show, handleHide, handleSubmit, eventTemplate, pristine, submitting, valid } = this.props

    return (
      <Modal show={show} onHide={handleHide}>
        <Form onSubmit={ handleSubmit(this.handleFormSubmit.bind(this)) }>
          <Modal.Header closeButton>
            <Modal.Title>Add/Update Permalink</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Field
              name="event_permalink"
              component={this.renderTextField}
              placeholder="http://"
            />
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" size="sm" disabled={submitting} onClick={handleHide}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit" disabled={ submitting || !valid}>Submit</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    );
  }
}

function validate(formProps) {
  const errors = {};
  return errors;

}

EventPermalinkModal = reduxForm({
  form: 'EventPermalinkModal',
  enableReinitialize: true,
})(EventPermalinkModal);

function mapStateToProps(state, ownProps) {

  let returnState = {}

  let event_option_permalink = ownProps.event.event_options.find(event_option => event_option.event_option_name == 'seatube_permalink')
  if(event_option_permalink) {
    returnState.initialValues = { event_permalink: event_option_permalink.event_option_value }
  }

  return returnState
}

EventPermalinkModal = connect(
  mapStateToProps, actions
)(EventPermalinkModal)

export default connectModal({ name: 'eventPermalink', destroyOnHide: true })(EventPermalinkModal)