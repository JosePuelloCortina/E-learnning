import React from "react";
import { useNavigate } from "react-router-dom";
import style from "./FormularioRegistro.module.css";
import { useDispatch } from "react-redux";
import { createUser, allUser } from "../../redux/actions/index";
import GoogleLogin from "react-google-login";

export function validation(form) {
  let errors = {};
  console.log(errors);

  // USUARIO-(NAME)

  if (!form.name) {
    errors.name = "Ingrese su nombre";
  } else if (form.name.match(!/^([a-zA-Z]+)(\s[a-zA-Z]+)*$/)) {
    errors.name = "No se admiten caracteres especiales.";
  }

  // USUARIO-(EMAIL)

  if (!form.email) {
    errors.user = "Se requiere un correo electrónico";
  } else if (
    !form.email.match(
      /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
    )
  ) {
    errors.email = "Por favor ingrese un correo electrónico válido.";
  }

  // PASSWORD (CONTRASEÑA ALFANUMERICO)

  if (!form.password) {
    errors.password = "Por favor ingrese una contraseña.";
  } else if (
    !form.password.match(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z])\S{5,15}/
    )
  ) {
    errors.password =
      "La contraseña debe contener entre 5 y 15 caracteres, al menos una mayúscula, una minúscula un número, y un caracter especial.";
  }

  return errors;
}

export default function FormularioRegistro() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [errors, setErrors] = React.useState({});

  const [form, setForm] = React.useState({
    name: "",
    password: "",
    email: "",
    image: "",
    role: "",
  });

  const handleInputChange = function (e) {
    console.log(e);

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setErrors(
      validation({
        ...form,
        [e.target.name]: e.target.value,
      })
    );
  };

  const handleOnSubmit = (event) => {
    event.preventDefault();
    if (!form.name || !form.password || !form.email) {
      alert("Debes rellenar todos los campos antes de registrarte");
    } else {
      dispatch(createUser(form));
      alert("Usuario creado correctamente!");
      navigate(`/user`);
    }
  };
  function handleSelect2(e) {
    setForm({
      ...form,
      role: e.target.value,
    });
  }

  const user = {
    name: "",
    password: "1234",
    email: "",
    image: "",
    role: "alumno",
  };

  const handleSucces = (response) => {
    user.name = response.profileObj.name;
    user.email = response.profileObj.email;
    user.image = response.profileObj.imageUrl;
    console.log(user);
    dispatch(createUser(user));
    dispatch(allUser());
    navigate("/user");
  };

  const handleFailure = () => {};

  return (
    <div className={style.container}>
      <form class={style.form} onSubmit={(e) => handleOnSubmit(e)}>
        <div class={style.containerInput}>
          <div class={style.SubcontainerInput}>
            <label>User name</label>
            <input
              placeholder="Ingresa tu nombre..."
              type="text"
              name="name"
              autoComplete="off"
              onChange={handleInputChange}
              value={form.name}
            />
          </div>
          {errors.name && <p>{errors.name}</p>}

          <div class={style.SubcontainerInput}>
            <label>E-mail</label>
            <input
              placeholder="Ingresa tu e-mail..."
              type="text"
              name="email"
              autoComplete="off"
              onChange={handleInputChange}
              value={form.email}
            />
          </div>
          {errors.email && <p>{errors.email}</p>}

          <div class={style.SubcontainerInput}>
            <label>Password</label>
            <input
              placeholder="Ingresa tu contraseña..."
              type="Password"
              name="password"
              autoComplete="off"
              onChange={handleInputChange}
              value={form.password}
            />
          </div>
          {errors.password && <p>{errors.password}</p>}

          <div class={style.SubcontainerInput}>
            <br></br>
            <label>Imagen</label>
            <input
              placeholder="Ingresa tu imagen"
              type="url"
              name="img"
              autoComplete="off"
              onChange={handleInputChange}
              value={form.img}
            />
          </div>

          <div class={style.SubcontainerInput}>
            <label>Role</label>
            <select onChange={(e) => handleSelect2(e)}>
              <option value="instructor">Instructor</option>
              <option value="alumno">Alumno</option>
            </select>
          </div>
        </div>

        <button class={style.buttonRegistro} type="submit">
          REGISTRATE{" "}
        </button>
        <GoogleLogin
          clientId="182193606082-foogb22mq9p98ci7l3qc9he32nu60cd3.apps.googleusercontent.com"
          render={(renderProps) => (
            <button
              onClick={renderProps.onClick}
              disabled={renderProps.disabled}
            >
              REGISTRARSE CON GOOGLE
            </button>
          )}
          onSuccess={handleSucces}
          onFailure={handleFailure}
          cookiePolicy={"single_host_origin"}
        />
      </form>
    </div>
  );
}
