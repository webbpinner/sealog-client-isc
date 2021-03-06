import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { reduxForm, Field, reset } from 'redux-form';
import { FormGroup, Row, Button, Col, Card, Alert, Table, OverlayTrigger, Tooltip, Pagination } from 'react-bootstrap';
import moment from 'moment';
import CreateCruise from './create_cruise';
import UpdateCruise from './update_cruise';
import DeleteCruiseModal from './delete_cruise_modal';
import ImportCruisesModal from './import_cruises_modal';
import * as actions from '../actions';

let fileDownload = require('js-file-download');

const maxCruisesPerPage = 6

class Cruises extends Component {

  constructor (props) {
    super(props);

    this.state = {
      activePage: 1,
      cruiseUpdate: false
    }

    this.handlePageSelect = this.handlePageSelect.bind(this);
    this.handleCruiseImportClose = this.handleCruiseImportClose.bind(this);

  }

  componentWillMount() {
    this.props.fetchCruises();
  }

  handlePageSelect(eventKey) {
    this.setState({activePage: eventKey});
  }

  handleCruiseDeleteModal(id) {
    this.props.showModal('deleteCruise', { id: id, handleDelete: this.props.deleteCruise });
  }

  handleCruiseUpdate(id) {
    this.props.initCruise(id);
    this.setState({cruiseUpdate: true});
    window.scrollTo(0, 0);
  }

  handleCruiseShow(id) {
    this.props.showCruise(id);
  }

  handleCruiseHide(id) {
    this.props.hideCruise(id);
  }

  handleCruiseCreate() {
    this.props.leaveUpdateCruiseForm();
    this.setState({cruiseUpdate: false});
  }

  handleCruiseImportModal() {
    this.props.showModal('importCruises', { handleHide: this.handleCruiseImportClose });
  }

  handleCruiseImportClose() {
    this.props.fetchCruises();
  }

  exportCruisesToJSON() {
    fileDownload(JSON.stringify(this.props.cruises, null, "\t"), 'sealog_cruisesExport.json');
  }

  renderAddCruiseButton() {
    if (!this.props.showform && this.props.roles && this.props.roles.includes('admin')) {
      return (
        <div className="float-right">
          <Button variant="primary" size="sm" onClick={ () => this.handleCruiseCreate()} disabled={!this.state.cruiseUpdate}>Add Cruise</Button>
        </div>
      );
    }
  }

  renderImportCruisesButton() {
    if(this.props.roles.includes("admin")) {
      return (
        <div className="float-right">
          <Button variant="primary" size="sm" onClick={ () => this.handleCruiseImportModal()}>Import From File</Button>
        </div>
      );
    }
  }

  renderCruises() {

    const editTooltip = (<Tooltip id="editTooltip">Edit this cruise.</Tooltip>)
    const deleteTooltip = (<Tooltip id="deleteTooltip">Delete this cruise.</Tooltip>)
    const showTooltip = (<Tooltip id="showTooltip">Cruise is hidden, click to show.</Tooltip>)
    const hideTooltip = (<Tooltip id="hideTooltip">Cruise is visible, click to hide.</Tooltip>)

    return this.props.cruises.map((cruise, index) => {
      if(index >= (this.state.activePage-1) * maxCruisesPerPage && index < (this.state.activePage * maxCruisesPerPage)) {
        let deleteLink = (this.props.roles.includes('admin'))? <OverlayTrigger placement="top" overlay={deleteTooltip}><FontAwesomeIcon className="text-danger" onClick={ () => this.handleCruiseDeleteModal(cruise.id) } icon='trash' fixedWidth/></OverlayTrigger>: null
        let hiddenLink = null;

        if(this.props.roles.includes('admin') && cruise.cruise_hidden) {
          hiddenLink = <OverlayTrigger placement="top" overlay={showTooltip}><FontAwesomeIcon onClick={ () => this.handleCruiseShow(cruise.id) } icon='eye-slash' fixedWidth/></OverlayTrigger>
        } else if(this.props.roles.includes('admin') && !cruise.cruise_hidden) {
          hiddenLink = <OverlayTrigger placement="top" overlay={hideTooltip}><FontAwesomeIcon className="text-success" onClick={ () => this.handleCruiseHide(cruise.id) } icon='eye' fixedWidth/></OverlayTrigger>
        }

        let cruiseName = (cruise.cruise_additional_meta.cruise_name)? <span>Name: {cruise.cruise_additional_meta.cruise_name}<br/></span> : null
        let cruiseLocation = (cruise.cruise_location)? <span>Location: {cruise.cruise_location}<br/></span> : null
        let cruiseVessel = (cruise.cruise_additional_meta.cruise_vessel)? <span>Vessel: {cruise.cruise_additional_meta.cruise_vessel}<br/></span> : null
        let cruisePi = (cruise.cruise_pi)? <span>PI: {cruise.cruise_pi}<br/></span> : null

        return (
          <tr key={cruise.id}>
            <td className={(this.props.cruiseid == cruise.id)? "text-warning" : ""}>{cruise.cruise_id}</td>
            <td>{cruiseName}{cruiseVessel}{cruiseLocation}{cruisePi}Dates: {moment.utc(cruise.start_ts).format('L')}<FontAwesomeIcon icon='arrow-right' fixedWidth/>{moment.utc(cruise.stop_ts).format('L')}</td>
            <td>
              <OverlayTrigger placement="top" overlay={editTooltip}><FontAwesomeIcon className="text-primary" onClick={ () => this.handleCruiseUpdate(cruise.id) } icon='pencil-alt' fixedWidth/></OverlayTrigger>
              {deleteLink}
              {hiddenLink}
            </td>
          </tr>
        );
      }
    })
  }

  renderCruiseTable() {
    if(this.props.cruises && this.props.cruises.length > 0) {
      return (
        <Table responsive bordered striped>
          <thead>
            <tr>
              <th>Cruise</th>
              <th>Details</th>
              <th style={{width: "80px"}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {this.renderCruises()}
          </tbody>
        </Table>
      )
    } else {
      return (
        <Card.Body>No Cruises found!</Card.Body>
      )
    }
  }

  renderCruiseHeader() {

    const Label = "Cruises"
    const exportTooltip = (<Tooltip id="exportTooltip">Export Cruises</Tooltip>)

    return (
      <div>
        { Label }
        <div className="float-right">
          <OverlayTrigger placement="top" overlay={exportTooltip}><FontAwesomeIcon onClick={ () => this.exportCruisesToJSON() } icon='download' fixedWidth/></OverlayTrigger>
        </div>
      </div>
    );
  }

  renderPagination() {
    if(this.props.cruises && this.props.cruises.length > maxCruisesPerPage) {

      let priceCount = this.props.cruises.length;
      let last = Math.ceil(priceCount/maxCruisesPerPage);
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
        <Pagination>
          <Pagination.First onClick={() => this.setState({activePage: 1})} />
          <Pagination.Prev onClick={() => { if(this.state.activePage > 1) { this.setState(prevState => ({ activePage: prevState.activePage-1}))}}} />
          {rangeWithDots}
          <Pagination.Next onClick={() => { if(this.state.activePage < last) { this.setState(prevState => ({ activePage: prevState.activePage+1}))}}} />
          <Pagination.Last onClick={() => this.setState({activePage: last})} />
        </Pagination>
      )
    }
  }

  render() {
    if (!this.props.roles) {
        return (
          <div>Loading...</div>
        )
    }

    if(this.props.roles.includes("admin") || this.props.roles.includes('cruise_manager')) {

      let cruiseForm = null;
  
      if(this.state.cruiseUpdate) {
        cruiseForm = <UpdateCruise handleFormSubmit={ this.props.fetchCruises } />
      } else {
        cruiseForm = <CreateCruise handleFormSubmit={ this.props.fetchCruises } />
      }

      return (
        <div>
          <DeleteCruiseModal />
          <ImportCruisesModal  handleExit={this.handleCruiseImportClose} />
          <Row>
            <Col sm={12} md={7} lg={6} xl={{span:5, offset:1}}>
              <Card border="secondary">
                <Card.Header>{this.renderCruiseHeader()}</Card.Header>
                {this.renderCruiseTable()}
                {this.renderPagination()}
              </Card>
              <div style={{marginTop: "8px", marginRight: "-8px"}}>
                {this.renderAddCruiseButton()}
                {this.renderImportCruisesButton()}
              </div>
            </Col>
            <Col sm={12} md={5} lg={6} xl={5}>
              { cruiseForm }
            </Col>
          </Row>
        </div>
      );
    } else {
      return (
        <div>
          What are YOU doing here?
        </div>
      )
    }
  }
}

function mapStateToProps(state) {
  return {
    cruises: state.cruise.cruises,
    cruiseid: state.cruise.cruise.id,
    roles: state.user.profile.roles
  }
}

export default connect(mapStateToProps, actions)(Cruises);