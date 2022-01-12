let api = 'http://localhost:4000/api/products/get-products'
$(document).ready(function(){
    renderProducts(api);
    getCategory();
    
    $("#carrito").hide();
    $(document).on("click", "#homeIcon", function(){
        $("#home").show();
        $("#carrito").hide();
        $("#navPaginate").show();
        $("#selectContainer").show();
    })
    $(document).on("click", "#cartIcon", function(){
        $("#carrito").show();
        $("#home").hide();
        $("#navPaginate").hide();
        $("#selectContainer").hide();
    })

    $(document).on("click", "#disminuir", function(){
        cambiarCantidadYEliminar(this.id, this.value)
    })

    $(document).on("click", "#aumentar", function(){
        cambiarCantidadYEliminar(this.id, this.value)
    })

    $(document).on("click", "#eliminar", function(){
        cambiarCantidadYEliminar(this.id, this.value)
    })

    $(document).on("click", "#buttonPay", function(){
        if(Object.values(cart).length === 0){
            alert('Carrito Vacio, agrega algo al carrito para comprar');
        }else{
            alert('Pago realizado con exito, disfrute su compra')
            cart = {}
            renderCart()
            numeroVisibleCarrito()
        }
    })

    $(document).on("click", "#addCart", function(){
        const dataset = this.dataset
        setCarrito(dataset)   
        
        numeroVisibleCarrito()
        
    })

    // Ver el compotamiento del select de categoria y filtrar por la categoria elegida
    $(document).on('change', '#selectCategory', function(){
        let api = 'http://localhost:4000/api/products/get-product-by-category'
        valorCategory = $("#selectCategory option:selected").val()
        $(document).on("click", "#buttonCategory", async function(){
            if(valorCategory !== null && !isNaN(valorCategory)){
                await renderProductsByCategory(api, parseInt(valorCategory), 0)
                $("#navPaginate").show()
            }else{
                alert('Por favor selecciona una opcion valida')
            }
            valorCategory = null
        })
    })

    // Cambiar clase active de la paginacion
    $(document).on("click", ".page-item", async function(e){
        let number = e.target.outerText 
        let offsetCount = 10;
        let offset = offsetCount * (number - 1)
        let selectVal = parseInt($("#selectCategory").val())
        let api = 'http://localhost:4000/api/products/get-product-by-category'
        
        if($("#selectCategory").val() ===  null){
            selectVal = 0;
        }

        await renderProductsByCategory(api, selectVal, offset)
                
        numeroTmp = numeroPagina / 10
        countTmp = Math.ceil(numeroTmp);
        for(let i=1; i<=countTmp; i++){
            $(`#p${i}`).removeClass('active')
        }
        $(`#p${number}`).addClass('active')

    })

    $(document).on("click", "#search", async function(){
        await productosInput()
    })

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
    if(cantidadCarrito > 0){
        $("#emptyCart").hide();
    }else{
        $("#emptyCart").show();
    }
    let carro = $("#cartIcon");
    let childs = carro.children();
    carro.text(cantidadCarrito);
    carro.prepend(childs);
}

const cambiarCantidadYEliminar = (id, value) => {
    let nuevaCant = cart[value]
    if(id === 'disminuir' && cart.hasOwnProperty(value)){
        nuevaCant.cantidad = cart[value].cantidad - 1 
        if(nuevaCant.cantidad < 1){
            delete cart[value]
            numeroVisibleCarrito()
            return renderCart()
        }
        cart[value] = {...nuevaCant}
    }

    if(id === 'aumentar'){
        nuevaCant.cantidad = cart[value].cantidad + 1
        cart[value] = {...nuevaCant}
    }

    if(id === 'eliminar'){
        delete cart[value]
        numeroVisibleCarrito()
    }

    renderCart()
}


const sumarTotal = () => {
    totalCart = 0;
    totalCart = precioCart - descuentoCart
    $("#totalCarro").text(`Total: $${totalCart}`)
}

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

const renderCart = () => {
    const cloneCarrito = Object.values(cart).map(producto => {
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
    $("#tableCartBody").html(cloneCarrito);
    sumarPrecio();
    sumarCantidad();
    sumarDescuento();
    sumarTotal();
}

const setCarrito = (carro) => {
    const producto = {
        id: carro.id,
        precio: carro.price,
        descuento: carro.discount,
        nombre: carro.name,
        cantidad: 1
    }

    if(cart.hasOwnProperty(producto.id)){
        producto.cantidad = cart[producto.id].cantidad + 1   
    }

    cart[producto.id] = {...producto}
    renderCart()
}

// -------- FIN Funciones Carrito -----------

// -------- Funciones API -----------

let numeroPagina = 0 

const renderProducts = (api) => {
    axios.get(api)
    .then(res => {
        res.data.data.map(item => {
            const products = '<div class="card col-md-3" style="width: 25%;">' 
                    + `<img id="imgProduct" style="height: 15rem;" src="${item.url_image}"class="card-img-top" alt="...">` 
                    + '<div class="card-body text-center">' 
                        + `<h5 id="titleProduct" class="card-title">${item.name}</h5>`
                        + `<p id="priceProduct" class="card-text">$${item.price}</p>`
                        + `<button id="addCart" class="btn btn-dark" data-name="${item.name}" data-price="${item.price}" data-discount="${item.discount}" data-id="${item.id}" >add to cart</button>`
                        + '</div>'
                    + '</div>'
                $(".items").append(products);
                return products
        })
        numeroPagina = res.data.paginate[0].paginacion
        renderPaginate(numeroPagina)
    })
    .catch(err => console.log(err))  

}


const getCategory = () => {
    axios.get('http://localhost:4000/api/products/get-category')
    .then(res => {
        res.data.map(item => {
            const category = `<option value="${item.id}">` + `${item.name}` + '</option>'
                
            $(".categories").append(category);
        })
    })
    .catch(err => console.log(err))
}

const renderProductsByCategory = async (api, data, offset) => {
    const res = await axios.post(api, {
        id_category: data,
        offset
    })
    
    try{
        $(".items").empty()
        res.data.data.map(item => {
        const products = '<div class="card col-md-3" style="width: 25%;">' 
        + `<img id="imgProduct" style="height: 15rem;" src="${item.url_image}"class="card-img-top" alt="${item.name}">` 
        + '<div class="card-body text-center">' 
            + `<h5 id="titleProduct" class="card-title">${item.name}</h5>`
            + `<p id="priceProduct" class="card-text">$${item.price}</p>`
            + `<button id="addCart" class="btn btn-dark" data-name="${item.name}" data-price="${item.price}" data-discount="${item.discount}" data-id="${item.id}" >add to cart</button>`
            + '</div>'
        + '</div>'
        $(".items").append(products)    
        return products
        })

        //console.log(res.data.paginate[0].paginacion)
        numeroPagina = res.data.paginate[0].paginacion
        renderPaginate(numeroPagina) 

    }catch(err){
        console.log(err)
    }
    
}

const renderPaginate = (nPaginate) => {
    let numeroDividido = nPaginate / 10
    let rounded = Math.ceil(numeroDividido)

    $(".pagination").empty()
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

        $(".pagination").append(list)            
    }
}


const renderProductByInput = async (inputSearch) => {
    const res = await axios.post('http://localhost:4000/api/products/get-product-by-input', {
        inputSearch
    })

    try{
        $(".items").empty()
        if(res.data){
            res.data.map(item => {
            const products = '<div class="card col-md-3" style="width: 25%;">' 
            + `<img id="imgProduct" style="height: 15rem;" src="${item.url_image}"class="card-img-top" alt="${item.name}">` 
            + '<div class="card-body text-center">' 
                + `<h5 id="titleProduct" class="card-title">${item.name}</h5>`
                + `<p id="priceProduct" class="card-text">$${item.price}</p>`
                + `<button id="addCart" class="btn btn-dark" data-name="${item.name}" data-price="${item.price}" data-discount="${item.discount}" data-id="${item.id}" >add to cart</button>`
                + '</div>'
            + '</div>'
            $(".items").append(products)    
            return products
            })
    

        }else{
            const products = '<h2>' + 'Sin Productos' + '</h2>'
            $(".items").append(products)
        }

    }catch(err){
        console.log(err)
    }
}

const productosInput = async () => {
    const valorInput = $("#buscador").val()
    await renderProductByInput(valorInput)
    $("#navPaginate").hide();
}





