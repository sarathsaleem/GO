/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define,THREE, brackets: true, $, window, navigator , clearInterval , setInterval, d3, Float32Array*/

define(['libs/three'], function () {

    "use strict";

    var Table = function (data) {

        var that = this;

        this.elements = data.elements;
        this.screen = null;
        var elementsBox = [],
            elementsRefs = [],
            elementsPos = [],
            elementsGroup = [];
        var raycaster = new THREE.Raycaster(),
            mouse = new THREE.Vector2(),
            INTERSECTED;

        this.activeElement = null;
        this.activeNumber = 0;
        var cbs = [];
        this.subscribe = function (cb) {
            cbs.push(cb);
        };

        this.addAtomCenterAnimation = function () {


        };


        this.addElements = function (elements, screen) {
            this.screen = screen;
            var scene = screen.scene,
                dataelemnts = elements;

            var createElementOutterBox = (function () {
                var geo = new THREE.SphereGeometry(65, 20, 20),
                    color = new THREE.Color(),
                    w = 140,
                    h = 180,
                    xMinus = 1330,
                    yPlus = 990;

                return function (aNumber, num) {
                    var sphere = new THREE.Mesh(geo, new THREE.MeshBasicMaterial());
                    sphere.position.x = (dataelemnts[aNumber][3] * w) - xMinus;
                    sphere.position.y = -(dataelemnts[aNumber][4] * h) + yPlus;
                    sphere.position.z = 0;
                    sphere.aNumber = num + 1;

                    var box = new THREE.BoxHelper(sphere);
                    box.material =  new THREE.LineBasicMaterial({
                        color: 0xffffff,
                        opacity: 0.25,
                        transparent: true,
                        linewidth: 1,
                        vertexColors: THREE.VertexColors
                    });
                    box.aNumber = num + 1;

                    var positions = box.geometry.attributes.position.array,
                        colors = new Float32Array(positions.length);

                    for (var i = 0, i3 = 0; i < positions.length; i++, i3 += 3) {
                        color.setHex(Math.random() * 0xffffff);
                        colors[i3 + 0] = color.r;
                        colors[i3 + 1] = color.g;
                        colors[i3 + 2] = color.b;
                    }
                    box.geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));

                    elementsBox.push(box);
                    elementsRefs.push(sphere);//for mouse hover raycaster
                    elementsPos.push(sphere.position);

                    return box;
                };

            }());

            var createText = (function () {
                var geo = new THREE.PlaneBufferGeometry(100, 100, 1, 1);
                return function (aNumber, i) {
                    var material = getMaterial(elements[aNumber], i + 1);
                    var textMesh1 = new THREE.Mesh(geo, material);

                    textMesh1.position.x = elementsPos[i].x;
                    textMesh1.position.y = elementsPos[i].y;
                    textMesh1.position.z = 0;

                    //scene.add(textMesh1);
                    return textMesh1;

                };
            }());

            var getMaterial = function (element, n) {

                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');
                canvas.width = 128;
                canvas.height = 128;

                ctx.beginPath();
                ctx.font = "Bold 64px Arial";
                ctx.fillStyle = "#FFFFFF";
                ctx.textAlign = 'center';
                ctx.fillText(element[0], 64, 70);
                ctx.font = "Bold 20px Arial";
                ctx.fillText(element[1], 64, 110);
                ctx.font = "Bold 15px Arial";
                ctx.fillStyle = "#00ffd8";
                ctx.fillText(element[2], 64, 125);
                ctx.font = "Bold 25px Arial";
                ctx.fillStyle = "#00ff27";
                ctx.fillText(n, 105, 20);
                //ctx.fillText(user.name, 0, 100);
                // canvas contents will be used for a texture
                var texture = new THREE.Texture(canvas);
                texture.needsUpdate = true;

                var material = new THREE.MeshLambertMaterial({
                    map: texture,
                    side: THREE.DoubleSide,
                    depthTest: true,
                    transparent: true
                });

                return material;
            };

            Object.keys(elements).forEach(function (aNumber, i) {

                var elementGroup = new THREE.Group();
                elementGroup.aNumber = aNumber;

                var box = createElementOutterBox(aNumber, i);
                var text = createText(aNumber, i);
                elementGroup.add(box);
                elementGroup.add(text);

                elementsGroup.push(elementGroup);

                scene.add(elementGroup);
            });


            var ele = screen.renderer.domElement;

            function onDocumentMouseMove(event) {
                event.preventDefault();
                var viewportOffset = ele.getBoundingClientRect();//FIXME: calculate only on resize
                // these are relative to the viewport
                var top = viewportOffset.top;
                var left = viewportOffset.left;
                var cX = event.clientX - left,
                    cY = event.clientY - top;

                mouse.x = (cX / viewportOffset.width) * 2 - 1;
                mouse.y = -(cY / viewportOffset.height) * 2 + 1;

            }
            ele.addEventListener('mousemove', onDocumentMouseMove, false);



        };
        var currentNumber = null;
        this.hoverElement = function (elementBox) {
            var that = this;
            if (elementBox) {
                this.activeElement = elementBox;
                this.activeNumber = elementBox.aNumber;
            } else {
                this.activeElement = null;
                this.activeNumber = 0;
            }

            if (this.activeNumber !== currentNumber) {


                this.addHoverEffect(this.activeNumber);

                cbs.forEach(function (cb) {
                    cb(that.activeNumber);
                });
                currentNumber = this.activeNumber;
            }
        };

        this.addHoverEffect = function (num) {
            var aNumber = Number(num);
            elementsBox.forEach(function(box){
                 box.material.opacity = 0.25;
            });
            if (aNumber !== 0 ) {
                var box = elementsBox[aNumber -1];
                box.material.opacity = 1;
            }
        };

        this.atomCenterAnimation = function (screen) {


            //var geometry = new THREE.BoxHelper(15,15,15);

            var material = new THREE.LineBasicMaterial({
                color: 0xffffff,
                opacity: 1,
                linewidth: 3,
                vertexColors: THREE.VertexColors
            });


            //circleGeometry.vertices.shift();

            var sphere = new THREE.SphereGeometry(10);
            var object = new THREE.Mesh(sphere, material);
            var box = new THREE.BoxHelper(object);

            screen.scene.add(box);


        };
        /**
         *
         *
         */
        this.render = function () {
            //that.lineGlow.material.uniforms.viewVector.value = new THREE.Vector3().subVectors( that.screen.camera.position, that.lineGlow.position );
            raycaster.setFromCamera(mouse, that.screen.camera);
            var intersects = raycaster.intersectObjects(elementsRefs);
            if (intersects.length > 0) {
                if (INTERSECTED != intersects[0].object) {
                    INTERSECTED = intersects[0].object;
                    that.hoverElement(INTERSECTED);
                }
            } else {
                that.hoverElement(false);
                INTERSECTED = null;
            }
        };

        this.renderUpdates = [this.render];


    };

    Table.prototype.addTable = function (scene) {
        this.addElements(this.elements, scene);
        //this.atomCenterAnimation(scene);
    };

    return Table;

});