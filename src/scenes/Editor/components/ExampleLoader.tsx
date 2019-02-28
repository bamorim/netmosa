import * as React from 'react'
import { useState } from 'react'
import { Button, Menu, MenuItem } from '@material-ui/core'
import examples from 'examples'

interface Props {
  setCode: (code: string) => void
}

export default (props: Props) => {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)

  const setCodeAndClose = (newCode: string) => {
    props.setCode(newCode)
    setMenuAnchor(null)
  }

  return (
    <>
      <Button color="inherit" onClick={({ currentTarget }) => setMenuAnchor(currentTarget)}>
        Examples
      </Button>
      <Menu
        anchorEl={menuAnchor}
        open={menuAnchor !== null}
        onClose={() => setMenuAnchor(null)}
      >
        {examples.map((example, i) => (
          <MenuItem
            key={i}
            onClick={() => example.load().then(setCodeAndClose)}
          >
            {example.name}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
