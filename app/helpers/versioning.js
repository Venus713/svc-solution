const bumpVersion = (version, type) => {
  const nums = version.split('.')

  nums[0] = parseInt(nums[0]) ? parseInt(nums[0]) : 1
  nums[1] = parseInt(nums[1]) ? parseInt(nums[1]) : 0
  nums[2] = parseInt(nums[2]) ? parseInt(nums[2]) : 0

  if (type === 'MAJOR') ++nums[0]
  if (type === 'MINOR') ++nums[1]
  if (type === 'PATCH') ++nums[2]

  return nums.join('.')
}

module.exports = { bumpVersion }
