const { Buy, Order, Course, User, Role, Clase, BuyClase } = require("../../db");

const { DB_HOST, BASE_URL, ACCESS_TOKEN } = process.env;

// const BASE_URL = process.env.NODE_BASE_URL ? process.env.NODE_BASE_URL : 'http://localhost:3000'
// const BASE_BACK = process.env.NODE_BASE_BACK ? process.env.NODE_BASE_BACK : 'http://localhost:3001'

const BASE_URL2 =
  DB_HOST === "localhost"
    ? "http://localhost:3000"
    : "https://akademit.vercel.app";

const server = require("express").Router();
// SDK de Mercado Pago
const mercadopago = require("mercadopago");
const { route } = require("../Order/Order");

server.post("/", async (req, res, next) => {
  //  const id_orden = req.query.id
  // const id_buy = req.query.id
  // const id_buy = "394606a0-c77e-11ec-8c73-834ec4650dd3"
  let { idUser, idCourse, name, price } = req.body;
  console.log(idCourse, " idCourse");
  // const quantity = 1;
  //   const id_orden= 1
  //   // cargamos el carrido de la bd
  //   const carrito = [
  //     {title: "Producto 1", quantity: 5, price: 10.52},
  //     {title: "Producto 2", quantity: 15, price: 100.52},
  //     {title: "Producto 3", quantity: 6, price: 200}
  //   ]
  // const carrito = [
  //   {title: name, quantity: 1, price: price}
  // ]
  // const buy = await Order.findAll()
  //  console.log(buy + "aquí está la compra")
  // Agrega credenciales
  mercadopago.configure({
    access_token: ACCESS_TOKEN,
  });

  console.info("ml configured");
  // const items_ml = buy.map(i => ({
  //   title: i.courseName,
  //   unit_price: i.total_price,
  //   quantity: i.quantity,
  // }))

  var destroyOrder = await Order.findAll();

  if (destroyOrder.length > 0) {
    await Order.destroy({
      where: {
        id: destroyOrder[0].dataValues.id,
      },
    });
  }

  if (idUser && idCourse && name && price) {
    var newOrder = await Order.create({
      userId: idUser,
      courseId: idCourse,
      status: "created",
    });

    console.log("newOrder", newOrder);

    const items_ml = [
      {
        title: name,
        unit_price: price,
        quantity: 1,
      },
    ];
    console.info("compra", items_ml);
    // Crea un objeto de preferencia
    let preference = {
      items: items_ml,
      external_reference: `${newOrder.dataValues.id}`, //`${new Date().valueOf()}`,

      back_urls: {
        success: `${BASE_URL2}/purchaseok`,
        failure: `${BASE_URL2}/home`,
        pending: `${BASE_URL2}/home`,
        rejected: `${BASE_URL2}/home`,
      },
      payment_methods: {
        excluded_payment_types: [{ id: "ticket" }],
      },
    };
    console.log(idCourse, "esto es idcourse");
    console.info("preference:", preference);
    mercadopago.preferences
      .create(preference)

      .then(function (response) {
        console.info("respondio");
        // Este valor reemplazará el string"<%= global.id %>" en tu HTML
        global.id = response.body.id;
        console.log(response.body);
        res.json({ id: global.id, init_point: response.body.init_point });
      })
      .catch(function (error) {
        console.log(error);
      });
  }
});

server.get("/pagos", async (req, res) => {
  const mp = new mercadopago(ACCESS_TOKEN);

  const orderFindId = await Order.findAll({});
  console.log(orderFindId, "orderId");

  const id = orderFindId[0].dataValues.id;
  console.info("Buscando el id", id);
  try {
    const payment = await mp.get(`/v1/payments/search`, {
      external_reference: id,
    }); //{'status': 'created'})
    console.log("payment body", payment.body);
    const payment_status = payment.body.results[0].status;

    if (payment_status === "approved") {
      console.log("payment approved");
      const order = await Order.findByPk(id);
      order.status = "completed"; // "approved"
      await order.save();

      const course = await Course.findByPk(order.courseId, {
        include: [
          {
            model: Clase,
          },
        ],
      });
      const courseName = course.dataValues.name;
      const courseClases = course.dataValues.clases.map(
        (clase) => clase.dataValues.id
      );

      const user = await User.findByPk(order.userId, {
        include: [Role, Buy],
      });
      const userRole = user.dataValues.roles[0].dataValues.tipo;
      const userPurchase = user.dataValues.buys.map(
        (buy) => buy.dataValues.courseId
      );

      if (userPurchase.includes(order.courseId)) {
        return res.status(422).send("Ya compraste este curso");
      }
      if (userRole === "alumno") {
        Buy.create({
          courseName: courseName,
          discount: 0,
          pay_method: "tarjeta",
          total_price: course.dataValues.price,
          quantity: 1,
        }) //crea la compra
          .then((buyCourse) => {
            buyCourse.setCourse(order.courseId);
            buyCourse.setUser(order.userId);
            buyCourse.addClase(
              courseClases.map((clase) => clase),
              {
                through: {
                  status: false,
                  courseId: course.id,
                },
              }
            );
          }) //relaciona la compra con el curso y el usuario

          .catch((error) => {
            console.log(error);
          });
      } else {
        return res
          .status(422)
          .send("No tienes permiso para comprar este curso");
      }

      res.json({ status: "approved" });
    } else if (payment_status === "rejected") {
      console.log("payment not approved");
      return res.redirect(`${BASE_URL2}/home`);
    } else {
      res.json({ status: "not approved" });
    }
  } catch (error) {
    console.log(error);
  }
});

// .then(resultado  => {
//   console.info('resultado', resultado)
//   res.json({"resultado": resultado})

// })

// .catch(err => {
//   console.error('No se consulto:', err)
//   res.json({
//     error: err
//   })
// })

// })

// server.get("/pagos", (req, res)=>{
//   console.info("EN LA RUTA PAGOS ", req)
//   const payment_id= req.query.payment_id
//   const payment_status= req.query.status
//   const external_reference = req.query.external_reference
//   const merchant_order_id= req.query.merchant_order_id
//   console.log("EXTERNAL REFERENCE ", external_reference)

//Aquí edito el status de mi orden

// Order.findByPk(external_reference)
// .then((order) => {
//   order.payment_id= payment_id
//   order.payment_status= payment_status
//   order.merchant_order_id = merchant_order_id
//   order.status = "completed"
//   console.info('Salvando order')
//   order.save()
//   .then((_) => {
//     console.info('redirect success')

//     return res.redirect(`${BASE_URL}`)
//   }).catch((err) =>{
//     console.error('error al salvar', err)
//     return res.redirect(`${BASE_URL}/?error=${err}&where=al+salvar`)
//   })
// }).catch(err =>{
//   console.error('error al buscar', err)
//   return res.redirect(`${BASE_URL}/?error=${err}&where=al+buscar`)
// })

//  res.json({
//    "req": req
//   })

//proceso los datos del pago
// redirijo de nuevo a react con mensaje de exito, falla o pendiente
//res.send(`${payment_id} ${payment_status} ${external_reference} ${merchant_order_id} `)
// })

module.exports = server;
