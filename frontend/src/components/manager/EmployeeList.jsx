import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Button,
  Table,
  Badge,
} from 'react-bootstrap';


export default function EmployeeList() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    //Dummy values:
    const [employees] = useState([
        { id: 1, name: 'John Doe', username: 'john.doe', isManager: true },
        { id: 2, name: 'Jane Smith', username: 'jane.smith', isManager: false },
        { id: 3, name: 'Mike Johnson', username: 'mike.j', isManager: false }
      ]);


    return (
        <Row className="mb-4">
          <Col md={12}>
            <Card className="h-100">
              <Card.Header>
                <h5>Employee Management</h5>
              </Card.Header>
              <Card.Body>
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Username</th>
                      <th>Role</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp) => (
                      <tr key={emp.id}>
                        <td>{emp.id}</td>
                        <td>{emp.name}</td>
                        <td>{emp.username}</td>
                        <td>
                          <Badge bg={emp.isManager ? 'warning' : 'secondary'}>
                            {emp.isManager ? 'Manager' : 'Employee'}
                          </Badge>
                        </td>
                        <td>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => {/* TODO: Remove employee */}}
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
    );

} 

