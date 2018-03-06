import React, { Component } from 'react';
import Select from 'react-select'
import VirtualizedSelect from 'react-virtualized-select'
import './App.css'

import dbhelper from './helpers/dbhelper'
import buildSkillString from './helpers/buildSkillString'
import calculate from './helpers/calculate'

class App extends Component {
  constructor () {
    super()
    this.weaponTypes = dbhelper.weaponTypeDefs().map(x => ({ value: x.wep_type_id, label: x.name }))
    this.allWeapons = dbhelper.allWeapons().map(x => ({ value: x.wep_id, label: x.name }))
    this.skills = dbhelper.allSkills()
    this.calculate = this.calculate.bind(this)
    this.updateSkill = this.updateSkill.bind(this)
    this.selectWeaponClass = this.selectWeaponClass.bind(this)
    this.state = {
      selectedWeaponClass: null,
      skills: {
      }
    }
  }

  selectWeaponClass(selectedValue) {
    this.setState((prevState, props) => {
      return {
        ...prevState,
        selectedWeaponClass: selectedValue.value,
        selectedWeapons: dbhelper.filterWeapons({
          field_name: 'wep_type_id',
          field_value: selectedValue.value
        })
      }
    })
  }

  updateSkill(skillName) {
    return (selectedValue) => {
      console.log(skillName, selectedValue)
      this.setState((prevState, props) => {
        return {
          ...prevState,
          skills: {
            ...prevState.skills,
            [skillName]: selectedValue
          }
        }
      })
    }
  }

  calculate() {
    const skillsArray = Object.values(this.state.skills).filter(Boolean).map(x => x.value)
    calculate(skillsArray, this.state.selectedWeapons)
  }

  render() {
    return (
      <div className="App">
        <div>
          <h1>Select Your Weapon Class</h1>
          <VirtualizedSelect
            placeholder="Weapons"
            value={this.state.selectedWeaponClass}
            onChange={this.selectWeaponClass}
            options={this.weaponTypes}
          />
          <h1>Select Your Modifiers</h1>
          {
            this.skills.map((skill) => {
              const options = skill.values.map(x => ({ value: x, label: buildSkillString(x) }))
              return (
                <div key={skill.skill_id}>
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
          <button onClick={this.calculate}>Calculate!</button>
        </div>
      </div>
    )
  }
}

export default App;
