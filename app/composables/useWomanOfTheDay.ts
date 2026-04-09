export function useWomanOfTheDay<T>(women: Ref<T[] | null | undefined>) {
  const woman = computed(() => {
    const list = women.value
    if (!list?.length) return undefined

    const today = new Date()
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    let hash = 5381
    for (let i = 0; i < dateStr.length; i++) {
      hash = ((hash << 5) + hash) + dateStr.charCodeAt(i)
      hash = hash & hash
    }

    return list[Math.abs(hash) % list.length]
  })

  return { woman }
}
