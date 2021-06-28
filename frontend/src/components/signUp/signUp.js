import React, {useState} from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { ToastContainer, toast, Zoom, Bounce } from 'react-toastify';
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
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function SignUp({history}) {
const classes = useStyles();
const [username, setUsername] =useState("")
const [email, setEmail] = useState("")
const [password, setPassword] = useState("")
const [error, setError]=useState("")


const popError = (errorMessage) => {

  toast.error(errorMessage, {
    className :"error-toast",
    position:toast.POSITION.BOTTOM_RIGHT
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
        "/api/register",
        { username, email, password},
        config
      );
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("username", data.username);
      window.location.href = '/';
    } catch (error) {
      popError(error.response.data.error);
      setTimeout(() => {
        setError("");
      }, 5000);
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
          Sign up
        </Typography>
        <form className={classes.form} onSubmit={HandleSubmit} >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="username"
                variant="outlined"
                required
                fullWidth
                type="text"
                id="username"
                label="User Name"
                value={username}
                onChange ={ (e)=> setUsername(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="email"
                type="email"
                label="Email Address"
                name="email"
                value={email}
                onChange ={ (e)=> setEmail(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                value={password}
                onChange ={ (e)=> setPassword(e.target.value)}
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            Sign Up
          </Button>
          <Grid container justify="flex-end">
            <Grid item>
              <Link href="/signIn" variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
      <Box mt={5}>
      </Box>
    </Container>
  );
}