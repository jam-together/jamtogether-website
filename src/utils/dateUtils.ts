const formatDate = (input: Date | string) => {
  const date: Date = typeof input === 'string' ? new Date(input) : input
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} à ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
}

export { formatDate }
