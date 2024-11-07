import React, { useState } from 'react'
import { Form, Button, Table } from 'react-bootstrap'
import quantitySheetService from '../../../../CustomHooks/ApiServices/quantitySheetService'
import AssignTeamModal from './AssignTeamModal'

const CatchTeamAssignment = ({ selectedProject, catches, teams }) => {
  const [selectedQuantitySheets, setSelectedQuantitySheets] = useState([])
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectAll, setSelectAll] = useState(false)

  const handleQuantitySheetSelect = (sheetId) => {
    setSelectedQuantitySheets(prev => {
      if (prev.includes(sheetId)) {
        return prev.filter(id => id !== sheetId)
      }
      return [...prev, sheetId]
    })
  }

  const handleSelectAll = () => {
    setSelectAll(!selectAll)
    if (!selectAll) {
      setSelectedQuantitySheets(catches.map(sheet => sheet.quantitySheetId))
    } else {
      setSelectedQuantitySheets([])
    }
  }

  const handleAssign = async (teamId) => {
    try {
      // Update each selected quantity sheet with the new team
      for (const sheetId of selectedQuantitySheets) {
        const sheet = catches.find(c => c.quantitySheetId === sheetId)
        if (sheet) {
          await quantitySheetService.updateQuantitySheet(sheetId, {
            ...sheet,
            teamId: teamId
          })
        }
      }
      console.log('Successfully assigned team to selected catches')
      setSelectedQuantitySheets([])
      setSelectAll(false)
    } catch (error) {
      console.error('Error assigning team:', error)
    }
  }

  return (
    <div className="mt-4">
      <h4>Assign Teams to Catches</h4>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>
              <Form.Check
                type="checkbox"
                onChange={handleSelectAll}
                checked={selectAll}
              />
            </th>
            <th>Catch Number</th>
            <th>Inner Envelope</th>
            <th>Outer Envelope</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {catches.map(sheet => (
            <tr key={sheet.quantitySheetId}>
              <td>
                <Form.Check
                  type="checkbox"
                  checked={selectedQuantitySheets.includes(sheet.quantitySheetId)}
                  onChange={() => handleQuantitySheetSelect(sheet.quantitySheetId)}
                />
              </td>
              <td>{sheet.catchNo}</td>
              <td>{sheet.innerEnvelope}</td>
              <td>{sheet.outerEnvelope}</td>
              <td>{sheet.quantity}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      {selectedQuantitySheets.length > 0 && (
        <Button 
          variant="primary"
          onClick={() => setShowAssignModal(true)}
        >
          Assign Team
        </Button>
      )}

      <AssignTeamModal
        show={showAssignModal}
        onHide={() => setShowAssignModal(false)}
        teams={teams}
        onAssign={handleAssign}
      />
    </div>
  )
}

export default CatchTeamAssignment