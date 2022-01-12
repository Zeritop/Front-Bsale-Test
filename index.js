// creo una variable con la api principal
let api = 'https://backend-bsale-api-sebas.herokuapp.com/api/products/get-products'
// Empiezo a trabajar con jquery
$(document).ready(function(){
    renderProducts(api); // Funcion para mostrar los productos una vez cargada la pagina
    getCategory(); // Funcion para obtener las categorias del filtro

    //Busco el id 'carrito' y lo oculto para mostrarlo con un boton    
    $("#carrito").hide();
    // Al hacer click en el elemento con id 'homeIcon' se muestra el elemento home
    // se oculta el el elemento carrito
    // y se muestra la paginacion y el select categoria
    $(document).on("click", "#homeIcon", function(){
        $("#home").show();
        $("#carrito").hide();
        $("#navPaginate").show();
        $("#selectContainer").show();
    })

    // Al hacer click en el elemento 'cartIcon' se muestra el carrito
    //y se oculta el home, la paginacion y el select categoria
    $(document).on("click", "#cartIcon", function(){
        $("#carrito").show();
        $("#home").hide();
        $("#navPaginate").hide();
        $("#selectContainer").hide();
    })

    //Al hacer click en 'diminuir' cambia la cantidad de producto que hay en el carrito
    $(document).on("click", "#disminuir", function(){
        cambiarCantidadYEliminar(this.id, this.value)
    })

    //Al hacer click en 'aumentar' cambia la cantidad de producto que hay en el carrito
    $(document).on("click", "#aumentar", function(){
        cambiarCantidadYEliminar(this.id, this.value)
    })

    //Al hacer click en 'eliminar' se elimina el producto del carrito
    $(document).on("click", "#eliminar", function(){
        cambiarCantidadYEliminar(this.id, this.value)
    })

    //Al hacer click en el 'buttonPay' se muestra una alerta dependiendo si el carrito 
    //tiene productos o no
    $(document).on("click", "#buttonPay", function(){
        if(Object.values(cart).length === 0){
            alert('Carrito Vacio, agrega algo al carrito para comprar');
        }else{
            alert('Pago realizado con exito, disfrute su compra')
            cart = {}
            renderCart() //se renderea el carrito
            numeroVisibleCarrito() // se renderea el numero que sale en el navbar principal
        }
    })

    //Al hacer click en el boton del producto 'add to cart'
    // ese producto se añade al carrito
    $(document).on("click", "#addCart", function(){
        const dataset = this.dataset
        setCarrito(dataset) // se añaden los valores al carrito  
        
        numeroVisibleCarrito() // se renderea el numero que sale en el navbar principal
        
    })

    // Ver el compotamiento del select de categoria y filtrar por la categoria elegida
    $(document).on('change', '#selectCategory', function(){
        let api = 'https://backend-bsale-api-sebas.herokuapp.com/api/products/get-product-by-category'
        valorCategory = $("#selectCategory option:selected").val()
        // Hacer click en los botones de categoria y llamar a la api para traer los productos
        $(document).on("click", "#buttonCategory", async function(){
            if(valorCategory !== null && !isNaN(valorCategory)){
                await renderProductsByCategory(api, parseInt(valorCategory), 0)//funcion para llamar a la api
                $("#navPaginate").show() //se muestra la paginacion
            }else{
                alert('Por favor selecciona una opcion valida')
            }
            valorCategory = null
        })
    })

    // Cambiar clase active de la paginacion y traer los productos de la otra pagina
    $(document).on("click", ".page-item", async function(e){
        let number = e.target.outerText //se toma el valor del boton de la paginacion
        let offsetCount = 10; 
        // se multiplica la variable 'offsetCount' por el number menos 1, ya que la paginacion empieza desde 1
        //y para filtrar los elementos debe iniciar en 0, por lo que si se presiona el boton 1
        // se resta para quedar en 0 y asi traer los primero elementos de esa paginacion
        let offset = offsetCount * (number - 1) 
        let selectVal = parseInt($("#selectCategory").val()) // se obtiene el valor de el select de categori
        // api para buscat por categoria
        let api = 'https://backend-bsale-api-sebas.herokuapp.com/api/products/get-product-by-category'
        
        if($("#selectCategory").val() ===  null){
            // si el valor del select es null, transformo el valor a 0
            selectVal = 0;
        }

        await renderProductsByCategory(api, selectVal, offset) // funcion para renderear productos por categoria
        
        //Obtengo el numero de la pagina con la variable 'numeroPagina' (inicializada despues)
        //la divido en 10 para obtener el total de paginas par la paginacion
        numeroTmp = numeroPagina / 10 
        countTmp = Math.ceil(numeroTmp); //lo redondea siempre al numero mayor
        // recorro los elementos de la paginacion y le quito la clase 'active' a todos
        for(let i=1; i<=countTmp; i++){
            $(`#p${i}`).removeClass('active')
        }
        $(`#p${number}`).addClass('active') //le coloco la clase 'active' al elemento seleccionado

    })

    // Al hacer click en el elemento 'search' (boton de la barra de buscar)
    $(document).on("click", "#search", async function(){
        // se traen los productos que escribe el usuario
        await productosInput()
    })
    // Al presionar la tecla 'enter' se activa el boton 'search'
    $("#buscador").keypress(async function(e) {
        let code = (e.keyCode ? e.keyCode : e.which);
        if(code === 13){
            await productosInput()
        }
    });



})
// variables Carrito
let precioCart = 0;
let cantidadCart = 0;
let descuentoCart = 0;
let totalCart = 0;
let cart = {}

//variables Services
let valorCategory = null;

// -------- Funciones Carrito -----------

const numeroVisibleCarrito = () => {
    // Cantidad de elementos en el carrito (Visual)
    let cantidadCarrito = Object.values(cart).length;
    //si el carrito no tiene productos se muestra un mensaje de vacio
    if(cantidadCarrito > 0){
        $("#emptyCart").hide();
    }else{
        $("#emptyCart").show();
    }
    //se visualiza el numero de la cantidad de elementos que tiene el carro
    let carro = $("#cartIcon");
    let childs = carro.children();
    carro.text(cantidadCarrito);
    carro.prepend(childs);
}

//Cambiar la cantidad de los productos y eliminarlos
const cambiarCantidadYEliminar = (id, value) => {
    let nuevaCant = cart[value]
    // si se presiona el bototn disminuir y este tiene el valor otrogado por parametro
    //se disminuye la cantidad
    if(id === 'disminuir' && cart.hasOwnProperty(value)){
        nuevaCant.cantidad = cart[value].cantidad - 1
        //si la cantidad es menor a 1 o 0 este producto se elimina 
        if(nuevaCant.cantidad < 1){
            delete cart[value]
            numeroVisibleCarrito() // se actualiza el numero del carro
            return renderCart() // se renderea el carro
        }
        cart[value] = {...nuevaCant}
    }

    // si se aprieta el boton aumentar se aumenta la cantidad
    if(id === 'aumentar'){
        nuevaCant.cantidad = cart[value].cantidad + 1
        cart[value] = {...nuevaCant}
    }

    // si se aprieta el boton eliminar se elimina el producto
    if(id === 'eliminar'){
        delete cart[value]
        numeroVisibleCarrito() // se actualiza el numero del carro
    }

    renderCart() // se renderea el carrito
}

// Funcion para sumar el total de los productos incluyendo el descuento
const sumarTotal = () => {
    totalCart = 0;
    totalCart = precioCart - descuentoCart
    $("#totalCarro").text(`Total: $${totalCart}`)
}

// Funcion para sumar el descuento
const sumarDescuento = () => {
    descuentoCart = 0;
    const arr = Object.values(cart).map(producto => {
        return parseInt(producto.descuento) * parseInt(producto.cantidad)
    })
    for(let i=0; i<arr.length; i++){
        descuentoCart += arr[i]
    }
    $("#descuentoCarro").text(`Descuento: $${descuentoCart}`)
}

//Funcion para sumar la cantidad de los productos
const sumarCantidad = () => {
    cantidadCart = 0;
    const arr = Object.values(cart).map(producto => {
        return parseInt(producto.cantidad)
    })
    for(let i=0; i<arr.length; i++){
        cantidadCart += arr[i]
    }
    $("#cantidadCarro").text(`Cantidad: ${cantidadCart}`)
}
 
//Funcion para sumar el precio de los productos
const sumarPrecio = () => {
    precioCart = 0
    const arr = Object.values(cart).map(producto => {
        return parseInt(producto.precio) * parseInt(producto.cantidad)
    })
    for(let i=0; i<arr.length; i++){
        precioCart += arr[i]
    }
    $("#precioCarro").text(`Precio: $${precioCart}`)
}

//Funcion para mostrar los productos del carro
const renderCart = () => {
    //Recorro el objeto 'cart' en donde almaceno los productos del carro
    const cloneCarrito = Object.values(cart).map(producto => {
        //creo un fila de una tabla por cada producto y con su respectivo valor
        carrito = `<tr class="elementos" id="${producto.id}">` +
                '<td>' + `${ producto.nombre }` + '</td>'
                + '<td id="columnaPrecio">' + `${ producto.precio }` + '</td>'
                + '<td>' + `${ producto.descuento }` + '</td>'
                + '<td id="columnaCantidad">' + `${ producto.cantidad }` + '</td>'
                + '<td>' 
                    + `<button id="disminuir" value="${producto.id}" class="btn btn-warning">` + '-' + '</button>'
                    + `<button id="aumentar" value="${producto.id}" class="btn btn-primary" style="margin-left: 2px; margin-right: 2px;">` + '+' + '</button>'
                    + `<button id="eliminar" value="${producto.id}" class="btn btn-danger">` + 'x' + '</button>'
                + '</td>'
                + '</tr>'
        return carrito
        })
    $("#tableCartBody").html(cloneCarrito); // añado las filas la tabla
    //Invoco a las funciones de suma para los nuevos valores
    sumarPrecio();
    sumarCantidad();
    sumarDescuento();
    sumarTotal();
}

//Funcion para almacenar el carrito
const setCarrito = (carro) => {
    //obtengo el valor del producto ingresado por parametro
    const producto = {
        id: carro.id,
        precio: carro.price,
        descuento: carro.discount,
        nombre: carro.name,
        cantidad: 1
    }
    //Si el carro ya tiene la prodiedad 'id' se le suma la cantidad
    if(cart.hasOwnProperty(producto.id)){
        producto.cantidad = cart[producto.id].cantidad + 1   
    }
    // se añade el producto
    cart[producto.id] = {...producto}
    renderCart()// se invoca a la funcion para renderizar el carro
}

// -------- FIN Funciones Carrito -----------

// -------- Funciones API -----------

//variable para almacenar el numero de pagina para la paginacion
let numeroPagina = 0 

//Funcion para renderizar los productos al principio de la pagina
const renderProducts = (api) => {
    //realizo un llamada a la api con axios para traer los productos
    axios.get(api)
    .then(res => {
        res.data.data.map(item => {
            //se recorren los datos obtenidos y se crea un elemento HTML por cada producto
            const products = '<div class="card col-md-3" style="width: 25%;">' 
                    + `<img id="imgProduct" style="height: 15rem;" src="${item.url_image}"class="card-img-top" alt="...">` 
                    + '<div class="card-body text-center">' 
                        + `<h5 id="titleProduct" class="card-title">${item.name}</h5>`
                        + `<p id="priceProduct" class="card-text">$${item.price}</p>`
                        + `<button id="addCart" class="btn btn-dark" data-name="${item.name}" data-price="${item.price}" data-discount="${item.discount}" data-id="${item.id}" >add to cart</button>`
                        + '</div>'
                    + '</div>'
                $(".items").append(products); // se agrega el elemento HTML a la pagina
                return products
        })
        //Se obtiene el valor de la pagina
        numeroPagina = res.data.paginate[0].paginacion
        renderPaginate(numeroPagina)// se renderea la paginacion
    })
    .catch(err => console.log(err))  

}

//Funcion para obtener las categorias
const getCategory = () => {
    //Llamada a la api con axios
    axios.get('https://backend-bsale-api-sebas.herokuapp.com/api/products/get-category')
    .then(res => {
        res.data.map(item => {
            //se recorre los elementos y por cada uno se crea un HTML 'option'
            const category = `<option value="${item.id}">` + `${item.name}` + '</option>'
                
            $(".categories").append(category);// se agrega ala pagina
        })
    })
    .catch(err => console.log(err))
}

//Funcion para renderizar los productos por categoria
const renderProductsByCategory = async (api, data, offset) => {
    //Llamada a la api con axios tipo POST
    const res = await axios.post(api, {
        id_category: data,
        offset
    })
    
    try{
        //se vacia los elementos que contenga 'items'
        $(".items").empty()
        res.data.data.map(item => {
            //se recorren los elementos y se crea un HTML
        const products = '<div class="card col-md-3" style="width: 25%;">' 
        + `<img id="imgProduct" style="height: 15rem;" src="${item.url_image}"class="card-img-top" alt="${item.name}">` 
        + '<div class="card-body text-center">' 
            + `<h5 id="titleProduct" class="card-title">${item.name}</h5>`
            + `<p id="priceProduct" class="card-text">$${item.price}</p>`
            + `<button id="addCart" class="btn btn-dark" data-name="${item.name}" data-price="${item.price}" data-discount="${item.discount}" data-id="${item.id}" >add to cart</button>`
            + '</div>'
        + '</div>'
        $(".items").append(products)// se añaden los html a la pagina en el elemento 'items'
        return products
        })

        //console.log(res.data.paginate[0].paginacion)
        numeroPagina = res.data.paginate[0].paginacion
        renderPaginate(numeroPagina) 

    }catch(err){
        console.log(err)
    }
    
}

//Funcion para mostrar la paginacion
const renderPaginate = (nPaginate) => {
    //se obtiene el valor total de los elementos y se divide por 10
    //10 porque se traen 10 elementos
    let numeroDividido = nPaginate / 10
    let rounded = Math.ceil(numeroDividido) //se divide siempre hacia arriba para obtener las paginas

    // se vacia lo que tenga el elemento con la clase 'pagination'
    $(".pagination").empty()
    //se hace un ciclo dependiendo del valor obtenido y se agrega la paginacion con los numeros correspondientes
    for(let i=1; i<=rounded; i++){
        if(i === 1){
            list = '<li id="p1" class="page-item active">' +
                            '<a class="page-link" href="#">' + i + '</a>' 
                        + '</li>'

        }else{
            list = `<li id="p${i}" class="page-item">` +
                            '<a class="page-link" href="#">' + i + '</a>' 
                        + '</li>'
        }

        $(".pagination").append(list) // se añade la paginacion al html            
    }
}

//Funcion para renderizar los productos desde la barra de busqueda
const renderProductByInput = async (inputSearch) => {
    //llamda api con axio tipo POST
    const res = await axios.post('https://backend-bsale-api-sebas.herokuapp.com/api/products/get-product-by-input', {
        inputSearch
    })

    try{
        //se vacia el elemento 'items'
        $(".items").empty()
        if(res.data){
            res.data.map(item => {
                //se recoren los resultado y se crea un html por cada resultado
            const products = '<div class="card col-md-3" style="width: 25%;">' 
            + `<img id="imgProduct" style="height: 15rem;" src="${item.url_image}"class="card-img-top" alt="${item.name}">` 
            + '<div class="card-body text-center">' 
                + `<h5 id="titleProduct" class="card-title">${item.name}</h5>`
                + `<p id="priceProduct" class="card-text">$${item.price}</p>`
                + `<button id="addCart" class="btn btn-dark" data-name="${item.name}" data-price="${item.price}" data-discount="${item.discount}" data-id="${item.id}" >add to cart</button>`
                + '</div>'
            + '</div>'
            $(".items").append(products)// se añade al aleemnto items    
            return products
            })
    

        }else{
            // si no hay nada se visualiza un texto 'Sin Productos'
            const products = '<h2>' + 'Sin Productos' + '</h2>'
            $(".items").append(products)
        }

    }catch(err){
        console.log(err)
    }
}

//Funcion para obtener el valor de la barra de busqueda
const productosInput = async () => {
    const valorInput = $("#buscador").val()
    await renderProductByInput(valorInput) // se llama a la funcion para obtener los productos desde la barra
    $("#navPaginate").hide();// se oculta la paginacion
}





