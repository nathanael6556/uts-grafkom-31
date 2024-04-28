function createLeonard(GL, programInfo = null) {
    function createNullObject() {
        return new GLObject(GL, [], [], programInfo);
    }

    function createObject(objectData) {
        return new GLObject(GL, objectData.vertices, objectData.indices, programInfo);
    }

    const
        bodyHeight = 12, bodyWidth = 18,
        armsWidth = 6, candyHeight = 5;

    let objs = {};
    objs.root = createNullObject();
    {
        objs.head = createNullObject();
        objs.head.transform.translateY(bodyHeight);
        {   
            objs.baseHead = createObject(generateEllipsoid(100, 100, 30, 20, 15));
            objs.baseHead.transform.translateY(10);

            objs.eyes = createNullObject();
            objs.eyes.transform.translateY(10);
            {
                objs.leftEyeGroup = createNullObject();
                objs.leftEyeGroup.transform.rotateZ(LIBS.degToRad(5));
                objs.leftEyeGroup.transform.translateX(-12);
                objs.leftEyeGroup.transform.translateY(19);
                {
                    objs.leftEyeOuter = createObject(generateEllipsoid(100, 100, 8, 12, 7));
                    objs.leftEyeOuter.transform.scaleUniform(1.03);
                    {
                        objs.leftEyeBall = createObject(generateEllipsoid(100, 100, 6, 10, 7));
                        objs.leftEyeBall.transform.translateZ(2);
                        {
                            objs.leftIris = createObject(generateEllipsoid(100, 100, 4, 7, 4));
                            objs.leftIris.transform.translateZ(3.5);
                        }
                        objs.leftEyeBall.addChilds(objs.leftIris);
                    }
                    objs.leftEyeOuter.addChilds(objs.leftEyeBall);
                }
                objs.leftEyeGroup.addChilds(objs.leftEyeOuter);
                
                objs.rightEyeGroup = createNullObject();
                objs.rightEyeGroup.transform.rotateZ(LIBS.degToRad(-5));
                objs.rightEyeGroup.transform.translateX(12);
                objs.rightEyeGroup.transform.translateY(19);
                {
                    objs.rightEyeOuter = createObject(generateEllipsoid(100, 100, 8, 12, 7));
                    objs.rightEyeOuter.transform.scaleUniform(1.03);
                    {
                        objs.rightEyeBall = createObject(generateEllipsoid(100, 100, 6, 10, 7));
                        objs.rightEyeBall.transform.translateZ(2);
                        {
                            objs.rightIris = createObject(generateEllipsoid(100, 100, 4, 7, 4));
                            objs.rightIris.transform.translateZ(3.5);
                        }
                        objs.rightEyeBall.addChilds(objs.rightIris);
                    }
                    objs.rightEyeOuter.addChilds(objs.rightEyeBall);
                }
                objs.rightEyeGroup.addChilds(objs.rightEyeOuter);
            }
            objs.eyes.addChilds(objs.leftEyeGroup, objs.rightEyeGroup)
        }
        objs.head.addChilds(objs.baseHead, objs.eyes);

        objs.body = createObject(generateUnitCylinder())
        objs.body.transform.scaleX(bodyWidth);
        objs.body.transform.scaleY(bodyHeight);
        objs.body.transform.scaleZ(8);

        objs.legs = createNullObject();
        objs.legs.transform.translateY(-bodyHeight);
        {
            objs.leftLegGroup = createNullObject();
            objs.leftLegGroup.transform.translateX(-9);
            objs.leftLegGroup.transform.translateY(-8);
            objs.leftLegGroup.transform.rotateZ(LIBS.degToRad(-3));
            {
                objs.leftLeg = createObject(generateUnitCylinder());
                objs.leftLeg.transform.scaleX(9);
                objs.leftLeg.transform.scaleY(8);
                objs.leftLeg.transform.scaleZ(5);
                
                objs.leftFoot = createObject(generateEllipsoid(100, 100, 10, 5, 7));
                objs.leftFoot.transform.translateY(-8);
                objs.leftFoot.transform.translateZ(1.2);
            }
            objs.leftLegGroup.addChilds(objs.leftLeg, objs.leftFoot);

            objs.rightLegGroup = createNullObject();
            objs.rightLegGroup.transform.translateX(9);
            objs.rightLegGroup.transform.translateY(-8);
            objs.rightLegGroup.transform.rotateZ(LIBS.degToRad(3));
            {
                objs.rightLeg = createObject(generateUnitCylinder());
                objs.rightLeg.transform.scaleX(9);
                objs.rightLeg.transform.scaleY(8);
                objs.rightLeg.transform.scaleZ(5);
                
                objs.rightFoot = createObject(generateEllipsoid(100, 100, 10, 5, 7));
                objs.rightFoot.transform.translateY(-8);
                objs.rightFoot.transform.translateZ(1.2);
            }
            objs.rightLegGroup.addChilds(objs.rightLeg, objs.rightFoot);
        }
        objs.legs.addChilds(objs.leftLegGroup, objs.rightLegGroup);

        objs.arms = createNullObject();
        {
            objs.leftArm = createNullObject();
            objs.leftArm.transform.rotateZ(-LIBS.degToRad(-90));
            objs.leftArm.transform.translateX(-bodyWidth)
            {
                objs.leftUpperArm = createObject(generateUnitCylinder());
                objs.leftUpperArm.transform.scaleX(armsWidth);
                objs.leftUpperArm.transform.scaleY(armsWidth);
                objs.leftUpperArm.transform.scaleZ(armsWidth);
                objs.leftUpperArm.transform.translateY(armsWidth-5);

                objs.leftForeArm = createObject(generateUnitCylinder());
                objs.leftForeArm.transform.scaleX(armsWidth);
                objs.leftForeArm.transform.scaleY(armsWidth);
                objs.leftForeArm.transform.scaleZ(armsWidth);
                objs.leftForeArm.transform.translateY(armsWidth*2);

                objs.leftHand = createObject(generateEllipsoid(100, 100, 8, 7.1, 8));
                objs.leftHand.transform.translateY(18);
                {
                    objs.candy = createNullObject();
                    objs.candy.transform.scaleUniform(candyHeight/7).translate(2, 10, 2);
                    {
                        objs.candyHeadTail = createObject(generateEllipticCone(5, 5, 0.3, 0.3, 7/9));
                        objs.candyHeadTail.transform.rotateY(Math.PI/2);
                        objs.candyUpperBody = createObject(generateEllipticParaboloid(5, 5, 2, 2, 7/2));
                        objs.candyUpperBody.transform.rotateY(-Math.PI/2).translateX(7**2 / 4);
                        objs.candyLowerBody = createObject(generateEllipticParaboloid(5, 5, 2, 2, 7/2));
                        objs.candyLowerBody.transform.rotateY(Math.PI/2).translateX(-(7**2) / 4);
                    }
                    objs.candy.addChilds(objs.candyHeadTail, objs.candyUpperBody, objs.candyLowerBody);
                }
                objs.leftHand.addChilds(objs.candy);
            }
            objs.leftArm.addChilds(objs.leftUpperArm, objs.leftForeArm, objs.leftHand);

            objs.rightArm = createNullObject();
            objs.rightArm.transform.rotateZ(-LIBS.degToRad(90));
            objs.rightArm.transform.rotateX(-LIBS.degToRad(180));
            objs.rightArm.transform.translateX(bodyWidth)
            {
                objs.rightUpperArm = createObject(generateUnitCylinder());
                objs.rightUpperArm.transform.scaleX(armsWidth);
                objs.rightUpperArm.transform.scaleY(armsWidth);
                objs.rightUpperArm.transform.scaleZ(armsWidth);
                objs.rightUpperArm.transform.translateY(armsWidth-5);

                objs.rightForeArm = createObject(generateUnitCylinder());
                objs.rightForeArm.transform.scaleX(armsWidth);
                objs.rightForeArm.transform.scaleY(armsWidth);
                objs.rightForeArm.transform.scaleZ(armsWidth);
                objs.rightForeArm.transform.translateY(armsWidth*2);

                objs.rightHand = createObject(generateEllipsoid(100, 100, 8, 7.1, 8));
                objs.rightHand.transform.translateY(18);
            }
            objs.rightArm.addChilds(objs.rightUpperArm, objs.rightForeArm, objs.rightHand);
        }
        objs.arms.addChilds(objs.leftArm, objs.rightArm);
    }
    objs.root.addChilds(objs.head, objs.body, objs.arms, objs.legs);

    let pose = {}, objsArr = Object.values(objs);
    pose.T = new Pose(objsArr);

    objs.leftArm.transform
    .localRotateY(Math.PI/6)
    .localRotateZ(Math.PI/6);

    objs.rightArm.transform
    .localRotateY(-Math.PI/6)
    .localRotateZ(-Math.PI/6)

    pose.stand = new Pose(objsArr);

    pose.T.apply();

    objs.leftArm.transform
    .localRotateY(Math.PI/4)
    .localRotateZ(Math.PI/4);
    
    objs.rightArm.transform
    .localRotateY(Math.PI/8)
    .localRotateZ(-Math.PI/4)
    .translateZ(-4);
    
    objs.leftLegGroup.transform
    .rotateX(Math.PI/4);
    
    objs.rightLegGroup.transform
    .rotateX(-Math.PI/4);
    
    pose.walkRight = new Pose(objsArr);
    
    pose.T.apply();
    
    objs.leftArm.transform
    .localRotateY(-Math.PI/8)
    .localRotateZ(Math.PI/4)
    .translateZ(-4);

    objs.rightArm.transform
    .localRotateY(-Math.PI/4)
    .localRotateZ(-Math.PI/4);

    objs.leftLegGroup.transform
    .rotateX(-Math.PI/4);
    
    objs.rightLegGroup.transform
    .rotateX(Math.PI/4);
    
    pose.walkLeft = new Pose(objsArr);
    
    pose.T.apply();

    return {objs, pose};
}