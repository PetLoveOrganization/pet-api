import { filtersSchema } from './schemas/filters.schemas.js'

const partialSchema = filtersSchema.partial()

const test = (query) => {
  const result = partialSchema.safeParse(query)
  console.log(`Query: ${JSON.stringify(query)}`)
  if (result.success) {
    console.log('Success:', result.data)
  } else {
    console.log('Error:', JSON.stringify(result.error.flatten(), null, 2))
  }
  console.log('---')
}

test({ species: 'Dog' }) // Uppercase -> Should work
test({ species: 'dog, cat' }) // Space -> Should work
test({ species: 'fish' }) // Invalid -> Should fail
test({ species: '' }) // Empty -> Should work (empty array)
test({ species: 'dog,cat' }) // Valid -> Should work
