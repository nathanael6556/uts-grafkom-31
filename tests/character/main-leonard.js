function main() {
    var CANVAS = document.getElementById("canvas");
    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;

    /*========================= CAPTURE EVENTS ========================= */

    var AMORTIZATION = 0.95;
    var drag = false;
    var x_prev, y_prev;
    var dX = 0, dY = 0;
    var renderMode = 0;

    var mouseDown = function (e) {
        drag = true;
        x_prev = e.pageX, y_prev = e.pageY;
        e.preventDefault();
        return false;
    };

    var mouseUp = function (e) {
        drag = false;
    };

    var mouseMove = function (e) {
        if (!drag) return false;
        dX = (e.pageX - x_prev) * Math.PI / CANVAS.width,
            dY = (e.pageY - y_prev) * Math.PI / CANVAS.height;
        THETA += dX;
        PHI += dY;
        x_prev = e.pageX, y_prev = e.pageY;
        e.preventDefault();
    };

    var keyPress = function (e) {
        if (e.key == "c") {
            renderMode ^= 1;
        }
    };
    
    CANVAS.addEventListener("mousedown", mouseDown, false);
    CANVAS.addEventListener("mouseup", mouseUp, false);
    CANVAS.addEventListener("mouseout", mouseUp, false);
    CANVAS.addEventListener("mousemove", mouseMove, false);
    document.addEventListener("keypress", keyPress);

    /*========================= WEBGL CONTEXT ========================= */
    var GL;
    try {
        GL = CANVAS.getContext("webgl", { antialias: true });
        GL.getExtension("OES_element_index_uint");
        GL.getExtension('WEBGL_depth_texture');
    } catch (e) {
        alert("WebGL context cannot be initialized");
        return false;
    }

    /*========================= PROGRAMS ========================= */
    let renderProgramInfo;
    {
        let vertexShaderSource = document.querySelector("#vertexShader").text;
        let fragmentShaderSource = document.querySelector("#fragmentShader").text;
        let vertexShader = createShader(GL, GL.VERTEX_SHADER, vertexShaderSource);
        let fragmentShader = createShader(GL, GL.FRAGMENT_SHADER, fragmentShaderSource);
        let program = createProgram(GL, vertexShader, fragmentShader);
        renderProgramInfo = new ProgramInfo(GL, program);

        let addUniform = (...prop)=>renderProgramInfo.uniformConfig.addUniform(...prop);
        addUniform("color", "3fv");
        addUniform("PMatrix", "Matrix4fv");
        addUniform("VMatrix", "Matrix4fv");
        addUniform("lightPMatrix", "Matrix4fv");
        addUniform("lightVMatrix", "Matrix4fv");
        addUniform("MMatrix", "Matrix4fv");
        addUniform("normalMatrix", "Matrix4fv");

        addUniform("light_source_direction", "3fv");
        addUniform("light_source_ambient_color", "3fv");
        addUniform("light_source_diffuse_color", "3fv");
        addUniform("light_source_specular_color", "3fv");

        addUniform("cellSize", "1f");
        addUniform("spread", "1i");
        addUniform("bias", "1f");

        addUniform("mat_ambient_color", "3fv");
        addUniform("mat_diffuse_color", "3fv");
        addUniform("mat_specular_color", "3fv");
        addUniform("mat_shininess", "1f");

        addUniform("view_direction", "3fv");
    }

    let shadowProgramInfo;
    {
        let shadowVertexShaderSource = document.querySelector("#shadowVertexShader").text;
        let shadowFragmentShaderSource = document.querySelector("#shadowFragmentShader").text;
        let shadowVertexShader = createShader(GL, GL.VERTEX_SHADER, shadowVertexShaderSource);
        let shadowFragmentShader = createShader(GL, GL.FRAGMENT_SHADER, shadowFragmentShaderSource);
        let program = createProgram(GL, shadowVertexShader, shadowFragmentShader);
        shadowProgramInfo = new ProgramInfo(GL, program);

        let addUniform = (...prop)=>shadowProgramInfo.uniformConfig.addUniform(...prop);
        addUniform("PMatrix", "Matrix4fv");
        addUniform("VMatrix", "Matrix4fv");
        addUniform("MMatrix", "Matrix4fv");
        addUniform("normalMatrix", "Matrix4fv");
    }

    /*========================= OBJECTS ========================= */
    let floorData = {
        vertices: [
            -500., -200.,  500.,     0., 1., 0.,
             500., -200.,  500.,     0., 1., 0.,
             500., -200., -500.,     0., 1., 0.,
            -500., -200., -500.,     0., 1., 0.,
        ],
        indices: [
            0, 1, 2,
            2, 0, 3,
        ]
    };
    let floor = new GLObject(GL, floorData.vertices, floorData.indices);

    let leonard = createLeonard(GL);

    objects = [leonard.objs.root, floor];
    
    objects.forEach(obj => {
        obj.setup();
    });

    /*========================= UNIFORMS ========================= */

    const defaultColor = [0.7, 0.7, 0.7];
    const projMatrix = LIBS.get_ortho_proj(40, CANVAS.width / CANVAS.height, 1, 500);

    const cameraPosition = [0.,30.,140.];
    const cameraTarget = [0., 0., 0.]
    const cameraMatrix = LIBS.look_at(cameraPosition, cameraTarget, [0, 1, 0]);
    const viewDirection = Vector.sub(cameraTarget, cameraPosition).normalize().arr();
    const viewMatrix = Matrix.fromGLMatrix(cameraMatrix, 4, 4).inverse().toGLMatrix();
    
    const lightSourceAmbientColor = [0.3,0.3,0.3];
    const lightSourceDiffuseColor = [1.,1.,1.];
    const lightSourceSpecularColor = [1.,1.,1.];
    
    const matAmbientColor = [1.,1.,1.];
    const matDiffuseColor = [1.,1.,1.];
    const matSpecularColor = [1.,1.,1.];
    const matShininess = 20.;

    const lightSourcePosition = [20., 20., 20.];
    const lightSourceTarget = [0., 0., 0.];
    const lightSourceDirection = Vector.sub(lightSourcePosition, lightSourceTarget).normalize().arr();

    const cellSize = 1/1000;
    const spread = 2;
    const bias = 0.15;

    const lightProjMatrix = LIBS.get_ortho_proj(40, CANVAS.width / CANVAS.height, 1, 1000);
    const lightViewMatrix = Transform3.translateZ(
        Matrix.fromGLMatrix(
            LIBS.look_at(
                lightSourcePosition,
                lightSourceTarget,
                [0, 1, 0]
            ), 4, 4
        ).inverse(),
        -60
    ).toGLMatrix();

    var THETA = 0, PHI = 0;

    {
        let set = (...prop)=>renderProgramInfo.uniformConfig.setAndApplyUniformValue(...prop);
        set("color", defaultColor);
        set("PMatrix", false, projMatrix);
        set("VMatrix", false, viewMatrix);
        set("lightPMatrix", false, lightProjMatrix);
        set("lightVMatrix", false, lightViewMatrix);
        set("light_source_direction", lightSourceDirection);
        set("light_source_ambient_color", lightSourceAmbientColor);
        set("light_source_diffuse_color", lightSourceDiffuseColor);
        set("light_source_specular_color", lightSourceSpecularColor);

        set("mat_ambient_color", matAmbientColor);
        set("mat_diffuse_color", matDiffuseColor);
        set("mat_specular_color", matSpecularColor);
        set("mat_shininess", matShininess);
        set("cellSize", cellSize);
        set("spread", spread);
        set("bias", bias);

        set("view_direction", viewDirection);
    }

    const
        leonardColor = [0.0, 0.6, 0.2],
        leonardEyeBallColor = [.9, .9, .9],
        leonardIrisColor = [.1, .1, .1],
        candyBodyColor = [.6, .1, .1],
        candyHeadTailColor = [.8, .3, .15];

    let leonardDefaultConfig = renderProgramInfo.createUniformConfig();
    leonardDefaultConfig.addUniform("color", "3fv", leonardColor);

    let leonardEyeBallConfig = renderProgramInfo.createUniformConfig();
    leonardEyeBallConfig.addUniform("color", "3fv", leonardEyeBallColor);

    let leonardIrisConfig = renderProgramInfo.createUniformConfig();
    leonardIrisConfig.addUniform("color", "3fv", leonardIrisColor);

    let leonardMouthConfig = leonardIrisConfig;

    let leonardNoseConfig = leonardMouthConfig;

    let candyBodyConfig = renderProgramInfo.createUniformConfig();
    candyBodyConfig.addUniform("color", "3fv", candyBodyColor);

    let candyHeadTailConfig = renderProgramInfo.createUniformConfig();
    candyHeadTailConfig.addUniform("color", "3fv", candyHeadTailColor);

    const leonardEyeBalls = [leonard.objs.leftEyeBall, leonard.objs.rightEyeBall];
    const leonardIris = [leonard.objs.leftIris, leonard.objs.rightIris];
    const leonardMouthParts = [leonard.objs.lipsLeft, leonard.objs.lipsRight, leonard.objs.cheekLeft, leonard.objs.cheekRight];
    const leonardNoseParts = [leonard.objs.leftNose, leonard.objs.rightNose];
    const candyBody = [leonard.objs.candyUpperBody, leonard.objs.candyLowerBody];
    function setLeonardConfig() {
        Object.values(leonard.objs).forEach((obj) => {
            obj.objectUniformConfig = leonardDefaultConfig;
        });
        leonardEyeBalls.forEach((obj) => {
            obj.objectUniformConfig = leonardEyeBallConfig;
        });
        leonardIris.forEach((obj) => {
            obj.objectUniformConfig = leonardIrisConfig;
        });
        leonardMouthParts.forEach((obj) => {
            obj.objectUniformConfig = leonardMouthConfig;
        })
        leonardNoseParts.forEach((obj) => {
            obj.objectUniformConfig = leonardNoseConfig;
        })
        candyBody.forEach((obj)=> {
            obj.objectUniformConfig = candyBodyConfig;
        })
        leonard.objs.candyHeadTail.objectUniformConfig = candyHeadTailConfig;
    }

    {
        let set = (...prop)=>shadowProgramInfo.uniformConfig.setAndApplyUniformValue(...prop);
        set("PMatrix", false, lightProjMatrix);
        set("VMatrix", false, lightViewMatrix);
    }

    /*========================= DEPTH FRAME BUFFER & TEXTURE ========================= */
    var unusedTexture = GL.createTexture();
    var depthTextureSize = 1024;
    GL.bindTexture(GL.TEXTURE_2D, unusedTexture);
    GL.texImage2D(
        GL.TEXTURE_2D,      // target
        0,                  // mip level
        GL.DEPTH_COMPONENT, // internal format
        depthTextureSize,   // width
        depthTextureSize,   // height
        0,                  // border
        GL.DEPTH_COMPONENT, // format
        GL.UNSIGNED_INT,    // type
        null);              // data
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
    
    var depthFramebuffer = GL.createFramebuffer();
    GL.bindFramebuffer(GL.FRAMEBUFFER, depthFramebuffer);
    GL.framebufferTexture2D(
        GL.FRAMEBUFFER,       // target
        GL.DEPTH_ATTACHMENT,  // attachment point
        GL.TEXTURE_2D,        // texture target
        unusedTexture,         // texture
        0                     // mip level
    );
    
    // create a color texture of the same size as the depth texture
    const depthTexture = GL.createTexture();
    GL.bindTexture(GL.TEXTURE_2D, depthTexture);
    GL.texImage2D(
        GL.TEXTURE_2D,
        0,
        GL.RGBA,
        depthTextureSize,       // width
        depthTextureSize,       // height
        0,
        GL.RGBA,
        GL.UNSIGNED_BYTE,
        null,
    );
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
    GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
    
    // attach it to the framebuffer
    GL.framebufferTexture2D(
        GL.FRAMEBUFFER,        // target
        GL.COLOR_ATTACHMENT0,  // attachment point
        GL.TEXTURE_2D,         // texture target
        depthTexture,         // texture
        0                      // mip level
    );

    /*========================= DRAWING ========================= */
    GL.enable(GL.DEPTH_TEST);
    GL.depthFunc(GL.LEQUAL);
    GL.clearColor(0., 0., 0., 0.);
    GL.clearDepth(1.);

    /*========================= RENDER SHADOW ========================= */
    function renderShadow() {
        if (renderMode == 0) {
            GL.bindFramebuffer(GL.FRAMEBUFFER, depthFramebuffer);
            GL.viewport(0, 0, depthTextureSize, depthTextureSize);
        } else if (renderMode == 1) {
            GL.bindFramebuffer(GL.FRAMEBUFFER, null);
            GL.viewport(0, 0, CANVAS.width, CANVAS.height);
        }

        objects.forEach(obj => {
            obj.programInfo = shadowProgramInfo;
        });
        
        GL.clearColor(1., 1., 1., 1.);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
        
        objects.forEach(obj => {
            obj.render();
        });
    }

    function renderFull() {
        if (renderMode == 0) {
            GL.bindFramebuffer(GL.FRAMEBUFFER, null);
        } else if (renderMode == 1) {
            return;
        }

        GL.viewport(0, 0, CANVAS.width, CANVAS.height);
        GL.clearColor(0.0, 0.0, 0.0, 1.0);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

        GL.bindTexture(GL.TEXTURE_2D, depthTexture);

        objects.forEach(obj => {
            obj.programInfo = renderProgramInfo;
        });

        setLeonardConfig();

        objects.forEach(obj => {
            obj.render();
        });
    }

    /*========================= ANIMATIONS ========================= */
    function poseApplier({value}) {
        value.apply();
    }
    let transition = new TransitionManager()
    .add(poseApplier, new PoseInterpolator(leonard.pose.T, leonard.pose.stand), 2000, Easing.quadraticInOut)
    .add(poseApplier, new PoseInterpolator(leonard.pose.stand, leonard.pose.walkRight), 700, Easing.quadraticInOut)
    .add(poseApplier, new PoseInterpolator(leonard.pose.walkRight, leonard.pose.walkLeft), 700, Easing.quadraticInOut)
    .add(poseApplier, new PoseInterpolator(leonard.pose.walkLeft, leonard.pose.walkRight), 700, Easing.quadraticInOut)
    .add(poseApplier, new PoseInterpolator(leonard.pose.walkRight, leonard.pose.stand), 700, Easing.quadraticInOut)
    .add(poseApplier, new PoseInterpolator(leonard.pose.stand, leonard.pose.crouch), 200, Easing.sineInOut)
    .add(poseApplier, new PoseInterpolator(leonard.pose.crouch, leonard.pose.stand), 200, Easing.quadraticIn)
    .add(poseApplier, new PoseInterpolator(leonard.pose.stand, leonard.pose.airborne), 350, Easing.quadraticOut)
    .add(poseApplier, new PoseInterpolator(leonard.pose.airborne, leonard.pose.stand), 350, Easing.quadraticIn)
    .add(poseApplier, new PoseInterpolator(leonard.pose.stand, leonard.pose.crouch), 200, Easing.quadraticOut)
    .add(poseApplier, new PoseInterpolator(leonard.pose.crouch, leonard.pose.stand), 200, Easing.quadraticInOut)
    .add(poseApplier, new PoseInterpolator(leonard.pose.stand, leonard.pose.stand), 1000)
    .add(poseApplier, new PoseInterpolator(leonard.pose.stand, leonard.pose.crouch), 500, Easing.quadraticInOut)
    .add(poseApplier, new PoseInterpolator(leonard.pose.crouch, leonard.pose.stand), 100, Easing.quadraticIn)
    .add(poseApplier, new PoseInterpolator(leonard.pose.stand, leonard.pose.backFlip1), 170, Easing.quadraticIn)
    .add(poseApplier, new PoseInterpolator(leonard.pose.backFlip1, leonard.pose.backFlip2), 150)
    .add(poseApplier, new PoseInterpolator(leonard.pose.backFlip2, leonard.pose.backFlip3), 170)
    .add(poseApplier, new PoseInterpolator(leonard.pose.backFlip3, leonard.pose.backFlip4), 200)
    .add(poseApplier, new PoseInterpolator(leonard.pose.backFlip4, leonard.pose.stand), 300)
    .add(poseApplier, new PoseInterpolator(leonard.pose.stand, leonard.pose.crouch), 200, Easing.quadraticOut)
    .add(poseApplier, new PoseInterpolator(leonard.pose.crouch, leonard.pose.stand), 500, Easing.quadraticInOut);
    
    let prevTime = 0;
    function animate(time) {
        /*========================= TRANSFORMATIONS ========================= */
        if (!drag) {
            dX *= AMORTIZATION, dY *= AMORTIZATION;
            THETA += dX, PHI += dY;
        }

        let dt = time - prevTime;
        prevTime = time;
        
        objects.forEach((obj) => {
            obj.transform.reset();
        });

        floor.transform.translateY(170);
        transition.step(dt);
        
        objects.forEach((obj) => {
            obj.transform.rotateY(THETA);
            obj.transform.rotateX(PHI);
        });
        
        renderShadow();
        renderFull();

        GL.flush();
        window.requestAnimationFrame(animate);
    };
    window.requestAnimationFrame(animate);
}

window.addEventListener('load', main);