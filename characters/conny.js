function createConny(GL, programInfo = null) {
    function createNullObject() {
        return new GLObject(GL, [], [], programInfo);
    }

    function createObject(objectData) {
        return new GLObject(GL, objectData.vertices, objectData.indices, programInfo);
    }

    const
        bodyHeight = 23, bodyWidth = 16,
        armsWidth = 6;

    let objs = {};
    objs.root = createNullObject();
    {
        objs.head = createNullObject();
        objs.head.transform.translateY(bodyHeight);
        {
            objs.baseHead = createObject(generateEllipsoid(100, 100, 30, 27, 28));
            objs.baseHead.transform.translateY(10).scaleX(1);

            objs.ears = createNullObject();
            objs.ears.transform.rotateX(LIBS.degToRad(90)).translateY(40);
            {
                objs.leftEarGroup = createNullObject();
                objs.leftEarGroup.transform.translateX(-8);
                {
                    objs.leftEarTop = createObject(generateEllipticParaboloid(100,100,0.9567,0.36,6));
                    objs.leftEarTop.transform.translateZ(-27);
                    objs.leftEarBottom = createObject(generateEllipticParaboloid(100,100,0.5,0.1,5));
                    objs.leftEarBottom.transform.translateZ(-17).translateY(1.8);
                }
                objs.leftEarGroup.addChilds(objs.leftEarTop, objs.leftEarBottom);

                objs.rightEarGroup = createNullObject();
                objs.rightEarGroup.transform.translateX(8);
                {
                    objs.rightEarTop = createObject(generateEllipticParaboloid(100,100,0.9567,0.36,6));
                    objs.rightEarTop.transform.translateZ(-27);
                    
                    objs.rightEarBottom = createObject(generateEllipticParaboloid(100,100,0.5,0.1,5));
                    objs.rightEarBottom.transform.translateZ(-17).translateY(1.8);
                }
                objs.rightEarGroup.addChilds(objs.rightEarTop, objs.rightEarBottom);

            }
            objs.ears.addChilds(objs.leftEarGroup, objs.rightEarGroup);

            objs.faces = createNullObject();
            objs.faces.transform.translateY(15);
            objs.faces.transform.translateZ(27);
            {
                objs.leftEyeGroup = createObject(generateEllipsoid(100, 100, 2, 2, 1));
                objs.leftEyeGroup.transform.translateX(-4);
                
                objs.rightEyeGroup = createObject(generateEllipsoid(100, 100, 2, 2, 1));    
                objs.rightEyeGroup.transform.translateX(4);   
                
                objs.leftCheek = createObject(generateEllipsoid(100, 100, 3.5, 2, 1));
                objs.leftCheek.transform.translateZ(0).translateX(-7.5).translateY(-4);                   
                
                objs.rightCheek = createObject(generateEllipsoid(100, 100, 3.5, 2, 1));
                objs.rightCheek.transform.translateZ(0).translateX(7.5).translateY(-4);  
                
                objs.nose = createObject(generateEllipticCone(100, 100, 0.12, 0.1, 0.5));   
                objs.nose.transform.translateZ(-8).translateY(-3.5);

                objs.nose2 = createObject(generateEllipticCone(100, 100, 0.11, 0.09, 0.5));   
                objs.nose2.transform.translateZ(-8).translateY(-3.5);

                objs.outerMouth1 = createObject(generateBSpline([10, 10, 10, 9, 8, 9, 0, 5, 8, -9, 8, 9, -10, 10, 10], 100, 2));
                objs.outerMouth1.setDrawMode(GL.LINE_STRIP);
                objs.outerMouth1.transform.translateZ(-9).scaleX(0.5).scaleY(2).translateY(-28);

                objs.outerMouth2 = createObject(generateBSpline([10, 10, 10, 9, 8, 10, 0, 5, 10, -9, 8, 10, -10, 10, 10], 100, 2));
                objs.outerMouth2.setDrawMode(GL.LINE_STRIP);
                objs.outerMouth2.transform.translateZ(-9.1).scaleX(0.5).scaleY(0.2556).translateY(-10.2);

                objs.mouth = createObject(generateBSpline([10, 10, 10, 9, 8, 9, 0, 5, 8, -9, 8, 9, -10, 10, 10], 100, 2));
                objs.mouth.setDrawMode(GL.TRIANGLE_FAN);
                objs.mouth.transform.translateZ(-9.01).scaleX(0.5).scaleY(2).translateY(-28);

                objs.mouth2 = createObject(generateBSpline([10, 10, 10, 9, 8, 9, 0, 5, 8, -9, 8, 9, -10, 10, 10], 100, 2));
                objs.mouth2.setDrawMode(GL.TRIANGLE_FAN);
                objs.mouth2.transform.translateZ(-9.01).scaleX(0.37).scaleY(1).translateY(-22);

                objs.line = createObject(generateUnitCylinder());
                objs.line.transform.scaleY(1.5).scaleX(0.4).rotateX(LIBS.degToRad(0)).translateZ(1).translateY(-7);
            }
            objs.faces.addChilds(objs.leftEyeGroup, objs.rightEyeGroup, objs.nose, objs.nose2, objs.leftCheek, objs.rightCheek, objs.line, objs.mouth, objs.mouth2, objs.outerMouth1, objs.outerMouth2);
        }
        objs.head.addChilds(objs.baseHead, objs.ears, objs.faces);


        
        objs.body = createNullObject();
        {
            objs.chest = createObject(generateUnitCylinder());
            objs.chest.transform.scaleX(bodyWidth).scaleY(bodyHeight).scaleZ(8);

            objs.stomach = createObject(generateEllipsoid(100,100,bodyWidth+2,bodyHeight+2.5,12.5));
            objs.stomach.transform.translateY(-bodyHeight+9).translateZ(1);

        }
        objs.body.addChilds(objs.stomach, objs.chest);

        objs.legs = createNullObject();
        objs.legs.transform.translateY(-bodyHeight);
        {
            objs.leftLegGroup = createNullObject();
            objs.leftLegGroup.transform.translateX(-7);
            objs.leftLegGroup.transform.translateY(-bodyHeight+22);
            objs.leftLegGroup.transform.rotateZ(LIBS.degToRad(-4.5));
            {
                objs.leftLeg = createObject(generateUnitCylinder());
                objs.leftLeg.transform.translateY(-20)
                objs.leftLeg.transform.scaleX(6.4);
                objs.leftLeg.transform.scaleY(14);
                objs.leftLeg.transform.scaleZ(6);
                
                objs.leftFoot = createObject(generateEllipsoid(100, 100, 9, 5, 10));
                objs.leftFoot.transform.translateY(-32);
                objs.leftFoot.transform.translateZ(1);
            }
            objs.leftLegGroup.addChilds(objs.leftLeg, objs.leftFoot);

            objs.rightLegGroup = createNullObject();
            objs.rightLegGroup.transform.translateX(7);
            objs.rightLegGroup.transform.translateY(-bodyHeight+22);
            objs.rightLegGroup.transform.rotateZ(LIBS.degToRad(4.5));
            objs.rightLegGroup.transform.rotateAlong(LIBS.degToRad(60), [1,0,0], [-8,bodyHeight-26,0]);
            
            {
                objs.rightLeg = createObject(generateUnitCylinder());
                objs.rightLeg.transform.translateY(-20);
                objs.rightLeg.transform.scaleX(6.4);
                objs.rightLeg.transform.scaleY(14);
                objs.rightLeg.transform.scaleZ(6);
                
                objs.rightFoot = createObject(generateEllipsoid(100, 100, 9, 5, 10));
                objs.rightFoot.transform.translateY(-32);
                objs.rightFoot.transform.translateZ(1);

                // objs.rightShoes  = createObject(generateEllipsoid(100, 50, 20, 30, 20));
                // objs.rightShoes.transform.rotateX(LIBS.degToRad(90));
                
            }
            objs.rightLegGroup.addChilds(objs.rightLeg, objs.rightFoot);
        }
        objs.legs.addChilds(objs.leftLegGroup, objs.rightLegGroup);

        objs.arms = createNullObject();
        objs.arms.transform.translateY(2.5);
        {
            objs.leftArm = createNullObject();
            objs.leftArm.transform.rotateZ(-LIBS.degToRad(-90));
            objs.leftArm.transform.translateX(-bodyWidth);
            objs.leftArm.transform.rotateAlong(LIBS.degToRad(45), [0,0,1], [-8,bodyHeight-26,0]);
            {
                objs.leftUpperArm = createObject(generateUnitCylinder());
                objs.leftUpperArm.transform.scaleX(armsWidth);
                objs.leftUpperArm.transform.scaleY(armsWidth+2);
                objs.leftUpperArm.transform.scaleZ(armsWidth);
                objs.leftUpperArm.transform.translateY(armsWidth-5);


                objs.leftForeArm = createObject(generateUnitCylinder());
                objs.leftForeArm.transform.scaleX(armsWidth);
                objs.leftForeArm.transform.scaleY(armsWidth+2);
                objs.leftForeArm.transform.scaleZ(armsWidth);
                objs.leftForeArm.transform.translateY(armsWidth*2);

                objs.leftHand = createObject(generateEllipsoid(100, 100, 8, 7.1, 8));
                objs.leftHand.transform.translateY(18);
            }
            objs.leftArm.addChilds(objs.leftUpperArm, objs.leftForeArm, objs.leftHand);

            objs.rightArm = createNullObject();
            objs.rightArm.transform.rotateZ(-LIBS.degToRad(90));
            objs.rightArm.transform.translateX(bodyWidth)
            {
                objs.rightUpperArm = createObject(generateUnitCylinder());
                objs.rightUpperArm.transform.scaleX(armsWidth);
                objs.rightUpperArm.transform.scaleY(armsWidth+2);
                objs.rightUpperArm.transform.scaleZ(armsWidth);
                objs.rightUpperArm.transform.translateY(armsWidth-5);

                objs.rightForeArm = createObject(generateUnitCylinder());
                objs.rightForeArm.transform.scaleX(armsWidth);
                objs.rightForeArm.transform.scaleY(armsWidth+2);
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

    return objs;
}