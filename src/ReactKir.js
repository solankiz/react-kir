import React, { Component } from 'react';
import onClickOutside from 'react-onclickoutside';

import './ReactKir.css';

class ReactKir extends Component {
  constructor(props) {
    super(props);
    this.state = {
      placeholder: '',
      notFound: '',
      collector: '',
      defaults: true,
      handleSelectedArea: false,
      displayList: false,
      showSelected: [],
      datum: {},
      backupDatum: {},
      sendSelect: {}
    }
  }

  componentWillMount() {
    const datum = { ...this.props.renderData };
    const sendSelect = {};
    for (const obj in datum) {
        sendSelect[obj] = [];
      for (const ob of datum[obj]) {
        ob.selected = false;
      }
    }
    this.setState({ datum, sendSelect, backupDatum: { ...datum }, placeholder: this.props.placeholder }, () => {
      if (this.props.finalSelected) this.props.finalSelected(this.state.sendSelect);
    });
  }

  componentWillReceiveProps(props) {
    this.setState({ datum: { ...props.renderData }, placeholder: props.placeholder, backupDatum: { ...props.renderData } });
  }

  checkAutoFocus() {
    if (!this.refs.emptyInput.autofocus) this.refs.emptyInput.focus();
  }

  unSelectItem(user) {
    this.updatedViewList(user);
    if (!this.state.notFound && this.state.showSelected.length === 1) this.setState({ displayList: true });
  }

  getLabled() {
    return this.state.showSelected.map(({ label }) => label);
  }

  validKeyPress(keycode) {
    var valid =
      (keycode > 47 && keycode < 58) ||
      (keycode === 32 || keycode === 13) ||
      (keycode > 64 && keycode < 91) ||
      (keycode > 95 && keycode < 112) ||
      (keycode > 185 && keycode < 193) ||
      (keycode > 218 && keycode < 223);
    return valid;
  }

  updatedViewList(user = '') {
    this.getLabled();
    const sendSelect = {};
    const backup = { ...this.state.backupDatum };
    for (const catgry in backup) {
        sendSelect[catgry] = [];
      for (const obj of backup[catgry]) {
        if (user === obj.label && obj.label !== '') obj.selected = false;
        if (this.getLabled().includes(obj.label)) {
            sendSelect[catgry].push(obj);
            obj.selected = true;
        }
      }
      sendSelect[catgry] = [...sendSelect[catgry].map(obj => ({ id: obj.id, label: obj.label }))];
    }
    this.setState({ datum: backup, sendSelect, displayList: false, notFound: '', collector: '' }, () => {
        if (this.props.finalSelected) this.props.finalSelected(this.state.sendSelect);
    });
  }

  initClick() {
    this.setState({
      displayList: true,
      defaults: false,
      handleSelectedArea: true,
      showSelected: [...this.state.showSelected, { label: '' }]
    }, () => this.checkAutoFocus());
  }

  clickArea(e) {
    if (e.which !== 8) this.setState({ displayList: true }, () => this.checkAutoFocus());
  }

  checkDataForFilter(collector) {
    let cEmpty = 0;
    let setFinalDatum = {};
    for (const obj in this.state.backupDatum) {
      const filteredArray = [...this.state.backupDatum[obj]].filter(o => o.label.toLowerCase().indexOf(collector.toLowerCase()) > -1);
      if (filteredArray.length === 0) {
        cEmpty++;
      } else {
        for (const o of filteredArray) {
          if (this.getLabled().includes(o.label)) {
            o.selected = true;
          }
        }
      }
      setFinalDatum[obj] = [...filteredArray];
    }
    return {
      check: cEmpty === 2 || false,
      setFinalDatum
    }
  }

  clickBackspace(event) {
    if (!this.state.collector && !this.state.notFound && event.keyCode === 8 &&this.state.showSelected.length === 1) {
      this.setState({ displayList: true });
      return;
    }
    let collector = '';
    if (this.validKeyPress(event.keyCode)) {
      let getKey = event.key;
      collector = this.state.collector + getKey;
    } else if (event.keyCode === 8 && this.state.collector) {
      collector = this.state.collector.substring(0, this.state.collector.length - 1);
    } else if (!this.state.collector && event.keyCode === 8 && this.state.showSelected.length > 1) {
      const cpArr = this.state.showSelected;
      const arrFilter = cpArr.splice(cpArr.length - 2, 1);
      this.unSelectItem(arrFilter[0].label);
      this.checkAutoFocus();
      return;
    }
    let returnedObj = this.checkDataForFilter(collector);
    if (returnedObj.check) {
      this.setState({ displayList: false, notFound: collector, collector });
    } else {
      this.setState({ datum: returnedObj.setFinalDatum, displayList: true, notFound: '', collector });
    }
  }

  itemSelect(item) {
    this.refs.emptyInput.value = '';
    if (item.selected) return;
    item.selected = true;
    const arrFilter = this.state.showSelected.filter(v => v.label);
    this.setState({
      showSelected: [...arrFilter, item, { label: '' }]
    }, () => { 
      this.updatedViewList(); 
      this.checkAutoFocus(); 
    });
    
  }

  removeSelect(item) {
    this.refs.emptyInput.value = '';
    if (this.state.showSelected.length === 1) this.setState({ displayList: true });
    this.setState({
      showSelected: this.state.showSelected.filter(({ label }) => label !== item.label)
    }, () => {
      this.updatedViewList(item.label);
      this.checkAutoFocus();
    });    
  }

  handleClickOutside() {
    if (this.state.showSelected.length > 0 && !this.state.showSelected[0].label) {
      this.setState({ defaults: true, handleSelectedArea: false, displayList: false });
    } else {
      this.setState({ displayList: false });
    }
  }

  render() {
    let {
      placeholder,
      datum,
      defaults,
      handleSelectedArea,
      displayList,
      showSelected,
      notFound
    } = { ...this.state };
    return (
      <div>
        <section className="combo-major">
          {
            handleSelectedArea && showSelected.length > 0 &&
            <div className="display-selected" onClick={(e) => this.clickArea(e)}>
              <ul className="selected-ul">
                {
                  showSelected.map((item, idx) => {
                    return (
                      item.label &&
                      <li className="selected-li" key={idx.toString()}>
                        <span>{item.label}</span>
                        <span className="cross-icon" onClick={() => this.removeSelect(item)}></span>
                      </li>
                    )
                  })
                }
                <li className="empty-input">
                  <input type="text" ref="emptyInput" onKeyDown={(e) => this.clickBackspace(e)} />
                </li>
              </ul>
            </div>
          }
          {
            defaults &&
            <div className="display-no-selected" onClick={this.initClick.bind(this)}>
              <span>{placeholder}</span>
            </div>
          }
          {
            displayList &&
            <div className="display-list">
              <ul className="outer-list-ul">
                {
                  Object.keys(datum).map((catgry, i) => {
                    return (
                      <li className="outer-list-li" key={i.toString()}>{catgry}
                        <ul className="inner-ul">
                          {
                            datum[catgry].map((obj, idx) => {
                              return (
                                <li key={idx.toString()} className={obj.selected ? 'selected' : ''}
                                  onClick={() => this.itemSelect(obj)}>
                                  <span>{obj.label}</span>
                                </li>
                              )
                            })
                          }
                        </ul>
                      </li>
                    )
                  })
                }
              </ul >
            </div >
          }
          {
            notFound &&
            <div className="display-list">
              <span><i>No Result Found for:</i>" {notFound} "</span>
            </div>
          }
        </section >
      </div >
    );
  }
}

export default onClickOutside(ReactKir);