import React, { Component } from 'react';
import Select from 'react-select'
import VirtualizedSelect from 'react-virtualized-select'
import DisplayTable from './components/DisplayTable'
import './App.css'
import { Card, CardHeader, CardTitle, CardText } from 'material-ui/Card'
import AppBar from 'material-ui/AppBar'
import Checkbox from 'material-ui/Checkbox'
import RaisedButton from 'material-ui/RaisedButton'

import styled, { css } from 'styled-components'
import dbhelper from './helpers/dbhelper'
import buildSkillString from './helpers/buildSkillString'
import calculate from './helpers/calculate'

const DarkenedCardHeader = styled(CardHeader)`
  background-color: rgba(0,0,0, .1);
`

const FlexDiv = styled.div`
  display: flex;
  padding: 5px;
  ${props => props.spaceEvenly && css`
    justify-content: space-evenly;
  `}
  ${props => props.center && css`
    justify-content: center;
  `}
`

const CalculateButton = styled.button`
  width: 300px;
  height: 50px;
  margin: 0 10%;
`

const Header = styled.h1`
  margin-top: 5px;
  font-size: 1.5em;
`

const SelectorDiv = styled.div`
  padding: 5px;
  border: 1px solid black;
  border-radius: 5px;
  box-shadow: 3px 3px 0px 0px rgba(0, 0, 0, 0.4);
`

class App extends Component {
  constructor () {
    super()
    this.weaponTypes = dbhelper.weaponTypeDefs().map(x => ({ value: x.wep_type_id, label: x.name }))
    this.allWeapons = dbhelper.allWeapons().map(x => ({ value: x.wep_id, label: x.name }))
    this.sharpnessLevels = [
      { value: 0, label: 'Red' },
      { value: 1, label: 'Orange' },
      { value: 2, label: 'Yellow' },
      { value: 3, label: 'Green' },
      { value: 4, label: 'Blue' },
      { value: 5, label: 'White' }
    ]
    this.skills = dbhelper.allSkills()
    this.calculateAndReplace = this.calculateAndReplace.bind(this)
    this.calculateAndAdd = this.calculateAndAdd.bind(this)
    this.updateSkill = this.updateSkill.bind(this)
    this.selectWeaponClass = this.selectWeaponClass.bind(this)
    this.selectSharpnessLevel = this.selectSharpnessLevel.bind(this)
    this.selectHandicraftLevel = this.selectHandicraftLevel.bind(this)
    this.handleSingleWeaponToggle = this.handleSingleWeaponToggle.bind(this)
    this.updateAugment = this.updateAugment.bind(this)
    this.state = {
      selectedSharpnessLevel: null,
      selectedWeaponClass: null,
      handicraftLevel: 0,
      skills: localStorage.getItem('savedSkills') ? JSON.parse(localStorage.getItem('savedSkills')) : {},
      selectedWeapons: [],
      calculatedWeapons: localStorage.getItem('savedWeapons') ? JSON.parse(localStorage.getItem('savedWeapons')) : [],
      singleWeapon: false,
      augments: {
        0: null,
        1: null,
        2: null
      }
    }
  }

  updateAugment(index) {
    return (selectedValue) => {
      this.setState((prevState) => {
        return {
          ...prevState,
          augments: {
            ...prevState.augments,
            [index]: selectedValue && selectedValue.value
          }
        }
      })
    }
  }

  handleSingleWeaponToggle(event) {
    this.setState((prevState) => {
      return {
        ...prevState,
        singleWeapon: !prevState.singleWeapon
      }
    })
  }

  selectHandicraftLevel(selectedValue) {
    this.setState((prevState, props) => {
      return {
        ...prevState,
        handicraftLevel: selectedValue ? selectedValue.value : 0
      }
    })
  }

  selectSharpnessLevel(selectedValue) {
    this.setState((prevState, props) => {
      return {
        ...prevState,
        selectedSharpnessLevel: selectedValue ? selectedValue.value : 5
      }
    })
  }

  selectWeaponClass(selectedValue) {
    let selectedWeapons
    if (this.state.singleWeapon) {
      selectedWeapons = dbhelper.filterWeapons({
        field_name: 'wep_id',
        field_value: selectedValue && selectedValue.value
      })
    } else {
      selectedWeapons = dbhelper.filterWeapons({
        field_name: 'wep_type_id',
        field_value: selectedValue && selectedValue.value
      })
    }
    this.setState((prevState, props) => {
      return {
        ...prevState,
        selectedWeaponClass: selectedValue && selectedValue.value,
        selectedWeapons,
        augments: { 0: null, 1: null, 2: null }
      }
    })
  }

  updateSkill(skillName) {
    return (selectedValue) => {
      console.log(skillName, selectedValue)
      this.setState((prevState, props) => {
        const newSkills = {
          ...prevState.skills,
          [skillName]: selectedValue
        }
        localStorage.setItem('savedSkills', JSON.stringify(newSkills))
        return {
          ...prevState,
          skills: newSkills
        }
      })
    }
  }

  calculateAndAdd() {
    const augments = Object.values(this.state.augments).filter(Boolean).reduce((a,v,i) => {
      if (v === 'attack') {
        a['augment'+i] = { value: { attack: 5 } }
      } else if (v === 'affinity') {
        a['augment'+i] = { value: { affinity: 5 } }
      }
      return a
    }, {})
    const skillsAndAugments = {
      ...this.state.skills,
      ...augments
    }
    const results = calculate(skillsAndAugments, this.state.selectedWeapons, this.state.selectedSharpnessLevel, this.state.handicraftLevel)
    this.setState((prevState, props) => {
      const newWeapons = this.state.calculatedWeapons.concat(results)
      localStorage.setItem('savedWeapons', JSON.stringify(newWeapons))
      return {
        prevState,
        calculatedWeapons: newWeapons
      }
    })
  }

  calculateAndReplace() {
    const augments = Object.values(this.state.augments).filter(Boolean).reduce((a,v,i) => {
      if (v === 'attack') {
        a['augment'+i] = { value: { attack: 5 } }
      } else if (v === 'affinity') {
        a['augment'+i] = { value: { affinity: 5 } }
      }
      return a
    }, {})
    const skillsAndAugments = {
      ...this.state.skills,
      ...augments
    }
    const results = calculate(skillsAndAugments, this.state.selectedWeapons, this.state.selectedSharpnessLevel, this.state.handicraftLevel)
    this.setState((prevState, props) => {
      localStorage.setItem('savedWeapons', JSON.stringify(results))
      return {
        prevState,
        calculatedWeapons: results
      }
    })
  }

  render() {
    let augments
    if (this.state.selectedWeapons[0]) {
      let numAugs
      const rarity = this.state.selectedWeapons[0].rarity
      if (rarity === 8) numAugs = 1
      if (rarity === 7) numAugs = 2
      if (rarity === 6) numAugs = 3

      augments = Array.from({ length: numAugs }, (x, i) => (
        <Select
          style={{width: 150}}
          key={i}
          value={this.state.augments[i]}
          placeholder="Augment"
          onChange={this.updateAugment(i)}
          options={[
            { value: "attack", label: "Attack Increase" },
            { value: "affinity", label: "Affinity Increase" }
          ]}
        />
      ))
    }

    return (
      <div className="App">
        <AppBar
          title="Critical Eye"
        />
        <div className="container">
          <Card>
            <DarkenedCardHeader
              title="Select your weapon"
            />
            <div style={{padding: 15}}>
              <Checkbox
                label="Single Weapon"
                checked={this.state.singleWeapon}
                onCheck={this.handleSingleWeaponToggle}
              />
              <FlexDiv spaceEvenly>
                <VirtualizedSelect
                  style={{width: 200}}
                  placeholder={this.state.singleWeapon ? "Weapon" : "Weapon type"}
                  value={this.state.selectedWeaponClass}
                  onChange={this.selectWeaponClass}
                  options={this.state.singleWeapon ? this.allWeapons : this.weaponTypes}
                />
                <Select
                  style={{width: 200}}
                  placeholder="Minimum sharpness"
                  value={this.state.selectedSharpnessLevel}
                  onChange={this.selectSharpnessLevel}
                  options={this.sharpnessLevels}
                />
              </FlexDiv>
              <FlexDiv center>
                {
                  this.state.singleWeapon && this.state.selectedWeapons[0] && this.state.selectedWeapons[0].final_form &&
                  augments
                }
              </FlexDiv>
            </div>
          </Card>
          <Card expandable={true} expanded={this.state.expanded}>
            <DarkenedCardHeader
              title="Select your modifiers"
              actAsExpander={true}
              showExpandableButton={true}
            />
            <CardText expandable={true} style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', alignContent: 'space-around'}}>
              {
                this.skills.map((skill) => {
                  const options = skill.values.map(x => ({ value: x, label: buildSkillString(x) }))
                  return (
                    <div key={skill.skill_id} style={{width: '30%'}}>
                      <span>{skill.name}</span>
                      <Select
                        onChange={this.updateSkill(skill.name)}
                        value={this.state.skills[skill.name]}
                        placeholder={skill.description}
                        options={options}
                      />
                    </div>
                    
                  )
                })
              }
              <div style={{width: '30%'}}>
                <span>Handicraft</span>
                <Select
                  onChange={this.selectHandicraftLevel}
                  value={this.state.handicraftLevel}
                  placeholder="Extends the weapon sharpness gauge. However, it will not increase the gauge past its maximum."
                  options={[1,2,3,4,5].map(x => ({ value: x, label: x }))}
                />
              </div>
            </CardText>
          </Card>
          <div style={{ display: 'flex', marginTop: 5, justifyContent: 'space-around' }}>
            <RaisedButton
              label="Calculate and replace"
              primary={true}
              onClick={this.calculateAndReplace}
              disabled={this.state.selectedWeapons.length === 0 || this.state.selectedSharpnessLevel < 0}
            />
            <RaisedButton
              label="Calculate and add"
              primary={true}
              onClick={this.calculateAndAdd}
              disabled={this.state.selectedWeapons.length === 0 || this.state.selectedSharpnessLevel < 0}
            />
          </div>
          <DisplayTable
            data={this.state.calculatedWeapons}
          />
        </div>
      </div>
    )
  }
}

export default App;
