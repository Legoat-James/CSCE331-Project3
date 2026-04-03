import React, { useState } from 'react';
import {
  Card,
  Button,
  Table,
  Modal,
  Form,
  Spinner,
  Alert,
} from 'react-bootstrap';
import { useGet, useMutate } from '../../hooks/useApi';

export default function EmployeeList() {
    const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
    const [showRemoveEmployeeModal, setShowRemoveEmployeeModal] = useState(false);
    const [employeeToRemove, setEmployeeToRemove] = useState(null);
    const [newEmployeeName, setNewEmployeeName] = useState('');
    const [newEmployeeUsername, setNewEmployeeUsername] = useState('');
    const [newEmployeePassword, setNewEmployeePassword] = useState('');
    const [newEmployeeIsManager, setNewEmployeeIsManager] = useState(false);

    const { data: allEmployees = [], isLoading, error, refetch } = useGet(
      ['employees'],
      '/api/employee/all'
    );

    // Filter out google_id and session_token
    const employees = allEmployees.map((emp, index) => {
      const { google_id, session_token, ...filteredEmp } = emp;
      const employeeId = emp.id ?? emp.employee_id ?? emp.employeeId ?? null;
      const snakeCaseName = [emp.first_name, emp.last_name].filter(Boolean).join(' ');
      const camelCaseName = [emp.firstName, emp.lastName].filter(Boolean).join(' ');
      const employeeName =
        emp.name ||
        snakeCaseName ||
        camelCaseName;
      const isManager =
        typeof emp.is_manager === 'boolean'
          ? emp.is_manager
          : typeof emp.isManager === 'boolean'
            ? emp.isManager
            : String(emp.role || '').toLowerCase() === 'manager';

      return {
        ...filteredEmp,
        employeeId,
        employeeName,
        isManager,
        rowKey: employeeId ?? emp.username ?? index,
      };
    });

    const removeEmployeeMutation = useMutate(
      employeeToRemove?.employeeId != null
        ? `/api/employee/disable?employeeID=${employeeToRemove.employeeId}`
        : '/api/employee/disable',
      'DELETE',
      ['employees']
    );

    const createEmployeeMutation = useMutate(
      '/api/employee/create',
      'POST',
      ['employees']
    );

    const handleRemoveEmployee = (employeeId) => {
      const employee = employees.find((emp) => emp.employeeId === employeeId) || { employeeId };
      setEmployeeToRemove(employee);
      setShowRemoveEmployeeModal(true);
    };

    const confirmRemoveEmployee = () => {
      if (employeeToRemove?.employeeId == null) {
        return;
      }

      removeEmployeeMutation.mutate(
        undefined,
        {
          onSuccess: () => {
            setShowRemoveEmployeeModal(false);
            setEmployeeToRemove(null);
          },
        }
      );
    };

    const closeRemoveEmployeeModal = () => {
      setShowRemoveEmployeeModal(false);
      setEmployeeToRemove(null);
    };

    const createEmployee = (employeeData) => {
      createEmployeeMutation.mutate(employeeData, {
        onSuccess: () => {
          setShowAddEmployeeModal(false);
          setNewEmployeeName('');
          setNewEmployeeUsername('');
          setNewEmployeePassword('');
          setNewEmployeeIsManager(false);
        },
      });
    };

    const handleCreateEmployee = (event) => {
      event.preventDefault();

      createEmployee({
        name: newEmployeeName,
        username: newEmployeeUsername,
        password: newEmployeePassword,
        is_manager: newEmployeeIsManager ? 'true' : 'false',
      });
    };


    return (
        <Card className="mb-4">
          <Card.Header className="d-flex justify-content-between align-items-center py-2">
            <h6 className="mb-0">Employee Management</h6>
            <div className="d-flex gap-2">
              <Button
                variant="outline-success"
                size="sm"
                onClick={() => setShowAddEmployeeModal(true)}
              >
                Add Employee
              </Button>
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => refetch()}
                disabled={
                  isLoading ||
                  removeEmployeeMutation.isPending ||
                  createEmployeeMutation.isPending
                }
              >
                {removeEmployeeMutation.isPending && <Spinner animation="border" size="sm" className="me-1" />}
                Refresh
              </Button>
            </div>
          </Card.Header>
          <Card.Body className="p-3">
            {error && <Alert variant="danger" className="mb-2">{error.message || 'Failed to load employees'}</Alert>}
            {removeEmployeeMutation.error && <Alert variant="danger" className="mb-2">{removeEmployeeMutation.error.message || 'Failed to remove employee'}</Alert>}
            {createEmployeeMutation.error && <Alert variant="danger" className="mb-2">{createEmployeeMutation.error.message || 'Failed to create employee'}</Alert>}
            
            {isLoading ? (
              <div className="text-center py-3">
                <Spinner animation="border" size="sm" />
              </div>
            ) : (
              <Table hover size="sm" className="mb-0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>ID</th>
                    <th>Manager</th>
                    <th>Username</th>
                    <th>Action</th>
                    <th>Update</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center text-muted py-2">
                        No employees found
                      </td>
                    </tr>
                  ) : employees.map((emp) => (
                    <tr key={emp.rowKey}>
                      <td>{emp.employeeName || 'N/A'}</td>
                      <td>{emp.employeeId ?? 'N/A'}</td>
                      <td>{emp.isManager ? 'Yes' : 'No'}</td>
                      <td>{emp.username}</td>
                      <td>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleRemoveEmployee(emp.employeeId)}
                          disabled={removeEmployeeMutation.isPending}
                        >
                          Remove
                        </Button>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          onClick={() => handleRemoveEmployee(emp.employeeId)}
                        >
                          Update
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>

          <Modal show={showAddEmployeeModal} onHide={() => setShowAddEmployeeModal(false)} centered>
            <Form onSubmit={handleCreateEmployee}>
              <Modal.Header closeButton>
                <Modal.Title>Add Employee</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form.Group className="mb-3" controlId="newEmployeeName">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={newEmployeeName}
                    onChange={(event) => setNewEmployeeName(event.target.value)}
                    placeholder="Jane Doe"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="newEmployeeUsername">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    value={newEmployeeUsername}
                    onChange={(event) => setNewEmployeeUsername(event.target.value)}
                    placeholder="jane.doe@example.com"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="newEmployeePassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={newEmployeePassword}
                    onChange={(event) => setNewEmployeePassword(event.target.value)}
                    placeholder="Password123"
                    required
                  />
                </Form.Group>

                <Form.Check
                  type="checkbox"
                  id="newEmployeeIsManager"
                  label="Manager"
                  checked={newEmployeeIsManager}
                  onChange={(event) => setNewEmployeeIsManager(event.target.checked)}
                />
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowAddEmployeeModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={createEmployeeMutation.isPending}
                >
                  {createEmployeeMutation.isPending ? 'Creating...' : 'Create'}
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>

          <Modal show={showRemoveEmployeeModal} onHide={closeRemoveEmployeeModal} centered>
            <Modal.Header closeButton>
              <Modal.Title>Confirm Remove Employee</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p className="mb-2">
                Are you sure you want to remove{' '}
                <strong>{employeeToRemove?.employeeName || employeeToRemove?.username || 'this employee'}</strong>?
              </p>
              <p className="mb-0 text-muted">
                Employee ID: {employeeToRemove?.employeeId ?? 'N/A'}
              </p>
              <p className="mb-0 text-muted">
                Username: {employeeToRemove?.username || 'N/A'}
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={closeRemoveEmployeeModal}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={confirmRemoveEmployee}
                disabled={removeEmployeeMutation.isPending}
              >
                {removeEmployeeMutation.isPending ? 'Removing...' : 'Remove'}
              </Button>
            </Modal.Footer>
          </Modal>
        </Card>
    );

} 

