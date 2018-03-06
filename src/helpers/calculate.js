import { BigNumber } from 'bignumber.js'
import dbhelper from './dbhelper'

export default function calculate(skillsArray, weaponArray, minimumSharpness, handicraftLevel) {
  const sharpnesses = ["red", "orange", "yellow", "green", "blue", "white"]

  const returnWeapons = weaponArray.map(weapon => {
    const sharpness_data = dbhelper.getSharpnessForHandicraftAndID(weapon.wep_id, handicraftLevel)
    const maxSharpnessValue = getMaxSharpnessValue(sharpness_data)
    const totalAttackMultiplier = getTotalAttackMultipliers(skillsArray)
    const totalAttackMod = getTotalAttackMod(skillsArray)
    const totalAttack = getTotalAttack(weapon.true_attack, totalAttackMultiplier, totalAttackMod)
    const totalAffinityMod = getTotalAffinityMod(skillsArray)
    const totalAffinity = getTotalAffinity(weapon.affinity, totalAffinityMod)
    const critBoost = skillsArray.find(x => x.critMulti) || 0.25
    const critMultiplier = getCritMultiplier(critBoost, totalAffinity)
    const isRanged = getIsRanged(weapon.wep_type_id)

    //console.log(totalAttackMultiplier, totalAttackMod, totalAttack, totalAffinity, critBoost, critMultiplier)
    let sharpnessIndex = minimumSharpness
    if (sharpnessIndex >= maxSharpnessValue) sharpnessIndex = maxSharpnessValue - 1
    const sharpnessesToCalculate = sharpnesses.slice(sharpnessIndex, maxSharpnessValue)
    console.log(sharpnessIndex, maxSharpnessValue, sharpnessesToCalculate)
    let damageCount = 0
    let sharpnessValue = 0
    sharpnessesToCalculate.forEach(sharp => {
      const newSharpness = sharpness_data[sharp]
      sharpnessValue += newSharpness
      //console.log(newSharpness, sharpnessValue)
      const newDamage = Math.round(new BigNumber(totalAttack)
      .times(critMultiplier)
      .times(isRanged ? 1 : dbhelper.getSharpnessMultiplier(sharp))
      .times(isRanged ? 1 : newSharpness).toNumber())

      damageCount += newDamage
      //console.log(newDamage, damageCount)
    })
    return {
      true_attack: weapon.true_attack,
      name: weapon.name,
      affinity: weapon.affinity,
      calculatedAttack: Math.round(new BigNumber(damageCount).div(sharpnessValue).toNumber()),
      sharpness: sharpness_data
    }
  })

  return returnWeapons
  
}

function getTotalAttack(trueAttack, totalAttackMultiplier, totalAttackMod) {
  return new BigNumber(trueAttack).times(totalAttackMultiplier).plus(totalAttackMod).toNumber()
}

function getTotalAffinity(affinity, totalAffinityMod) {
  const returnVal = affinity + totalAffinityMod
  if (returnVal > 100) return 100
  return returnVal
}

function getTotalAttackMod(skillsArray) {
  return skillsArray.reduce(getTotalModValue('attack'), 0)
}

function getTotalAffinityMod(skillsArray) {
  return skillsArray.reduce(getTotalModValue('affinity'), 0)
}

function getTotalAttackMultipliers(skillsArray) {
  return skillsArray.reduce(getTotalModValueMultiply('attackMulti'), 1)
}

function getCritMultiplier(critBoost, totalAffinity) {
  const critRate = new BigNumber(totalAffinity).div(100)
  return new BigNumber(critBoost).times(critRate).plus(1).toNumber()
}

function getIsRanged(wep_type_id) {
  const rangedWeapons = [ 12, 13, 14 ]
  return rangedWeapons.includes(wep_type_id)
}

function getMaxSharpnessValue(sharpness_data) {
  if (sharpness_data.white) return 6
  if (sharpness_data.blue) return 5
  if (sharpness_data.green) return 4
  if (sharpness_data.yellow) return 3
  if (sharpness_data.orange) return 2
  if (sharpness_data.red) return 1
}

const getTotalModValue = (valueName) => (a, v) => {
  if (v[valueName]) return a + v[valueName]
  return a
}

const getTotalModValueMultiply = (valueName) => (a, v) => {
  if (v[valueName]) return new BigNumber(a).times(1 + v[valueName]).toNumber()
  return a
}