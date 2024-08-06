import React, { useState } from 'react';
import { Container, Form, Button } from 'semantic-ui-react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('userEmail', email);
    navigate('/');
    window.location.reload();
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <Form.Field>
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Field>
        <Button type="submit" primary>Login</Button>
      </Form>
    </Container>
  );
};

export default Login;