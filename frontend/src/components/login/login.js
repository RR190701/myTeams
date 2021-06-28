import React, {useState} from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { ToastContainer, toast, Zoom, Bounce } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";


const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function SignIn({history}) {
  const classes = useStyles();
    
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

const popError = (errorMessage) => {

    toast.error(errorMessage, {
      className :"error-toast",
      position:toast.POSITION.TOP_RIGHT
    });
  }

  const HandleSubmit = async(e) =>{
    e.preventDefault();
    const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
    
      try {
        const { data } = await axios.post(
          "/api/login",
          { email, password },
          config
        );
        
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("username", data.username);
        window.location.href = '/';
      } catch (error) {
        popError(error.response.data.error);     
      }
    
    
    }

  return (
      
    <Container component="main" maxWidth="xs">

      <>
      <ToastContainer
      draggable ={false}
      autoClose={3000}
      ></ToastContainer>

      </>

      <CssBaseline />
      <div className={classes.paper}>
      <Avatar className={classes.avatar} alt ="microsoft teams" src ="https://image.flaticon.com/icons/png/512/732/732221.png">
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <form className={classes.form} onSubmit={HandleSubmit} >
          <TextField
            variant="outlined"
            margin="normal"
            required
            type="email"
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoFocus
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            Sign In
          </Button>
          <Grid container>
            <Grid item xs={5}>
              <Link href="#" variant="body2">
                Forgot password?
              </Link>
            </Grid>
            <Grid item xs={7}>
              <Link href="/signUp" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
    </Container>
  );
}