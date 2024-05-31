import React, { PropsWithChildren } from 'react'

interface IPlaygroundContextProps {

}

interface IPlaygroundContext {

}

const Context = React.createContext<IPlaygroundContext>({} as IPlaygroundContext)

export const PlaygroundContext: React.FC<PropsWithChildren<IPlaygroundContextProps>> = props => {

  const {
    children
  } = props

  return (
    <Context.Provider
      value={
        {}
      }>
      {children}
    </Context.Provider>
  )
} 