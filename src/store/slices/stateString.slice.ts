import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface StateStringState {
  isBoolean?: boolean
  name: string
  inStock?: string
}

const initialState: StateStringState = {
  isBoolean: false,
  name: '',
  inStock: '',
}

const stateStringSlice = createSlice({
  name: 'stateString',
  initialState,
  reducers: {
    setStateStringSlice: (state, action: PayloadAction<StateStringState>) => {
      state.isBoolean = action.payload.isBoolean ?? false
      state.name = action.payload.name
    },
    setInStock: (state, action: PayloadAction<string>) => {
      state.inStock = action.payload
    },
  },
})

export const { setStateStringSlice, setInStock } = stateStringSlice.actions
export default stateStringSlice.reducer
