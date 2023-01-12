# Servidor con Balance de Carga

## Consigna #1:
>Tomando con base el proyecto que vamos realizando, agregar un parámetro más en
la ruta de comando que permita ejecutar al servidor en modo fork o cluster. Dicho
parámetro será 'FORK' en el primer caso y 'CLUSTER' en el segundo, y de no
pasarlo, el servidor iniciará en modo fork.

### Solucion:
Para este desafio se usó el modulo **forever** en reemplazo de pm2.

Para resivir los parametros/argumentos usaremos el modulo **yargs** con la siguiente configuración:

	const args = yargs(process.argv.slice(2)).options({
		p: {
			alias: "port",
			default: "8080",
			describe: "Puerto de escucha del servidor",
		},
		m: {
			alias: "mode",
			default: "FORK",
			describe: "Modo de operacion del servidor",
			type: "string"
		},
	}).parse();

La cual, nos permitirá tomar los parametros que necesitemos o tener un valor por defecto si no se hace.

Por último el comando usado para ejecutar será:

	forever start server.js --port 8081 --mode CLUSTER

**--port** puede ser reemplazado por cualquier otro valor, no necesariamente el mostrado.

**--mode** puede resivir solo 2 valores "FORK" o "CLUSTER".

## Consigna #2:
> Configurar Nginx para balancear cargas de nuestro servidor de la siguiente manera:

> Redirigir todas las consultas a /api/randoms a un cluster de servidores escuchando en el puerto 8081. El cluster será creado desde node utilizando el módulo nativo cluster.

> El resto de las consultas, redirigirlas a un servidor individual escuchando en el puerto 8080.

> Verificar que todo funcione correctamente.

> Luego, modificar la configuración para que todas las consultas a /api/randoms sean redirigidas a un cluster de servidores gestionado desde nginx, repartiéndolas equitativamente entre 4 instancias escuchando en los puertos 8082, 8083, 8084 y 8085 respectivamente.

### Solución:

Generamos 4 clusters en 8082, 8083, 8084 y 8085:

	forever start index.js --port 8082 --mode CLUSTER
	forever start index.js --port 8083 --mode CLUSTER
	forever start index.js --port 8084 --mode CLUSTER
	forever start index.js --port 8085 --mode CLUSTER

Ahora se editó el archivo de configuración de Nginx **( nginx.conf )** para que distribuya la carga de la ruta **/api/randoms/**. Este archivo se encuentra en **" nginx-cfg/nginx.conf "**.

	events {}

	http {
    	include mime.types;
    	default_type application/octet-stream;

    	upstream node_app {
        	server 127.0.0.1:8082;
        	server 127.0.0.1:8083;
        	server 127.0.0.1:8084;
        	server 127.0.0.1:8085;
    	}

    	server {
        	listen 80;

        	location /api/random/ {
            	proxy_pass http://node_app;
        	}
    	}
	}

Y listo podremos acceder a traves de http://localhost/api/randoms/