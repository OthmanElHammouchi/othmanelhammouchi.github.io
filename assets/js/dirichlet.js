  /* Instantiate the Animation class. */
  /* The IDs given should match those used in the template above. */
  (function() {
    var img_id = "_anim_imgaaf287ee7fcd43509d0ee719649152a1";
    var slider_id = "_anim_slideraaf287ee7fcd43509d0ee719649152a1";
    var loop_select_id = "_anim_loop_selectaaf287ee7fcd43509d0ee719649152a1";
    var frames = new Array(100);
    
  for (var i=0; i<100; i++){
    frames[i] = "/assets/vid/dirichlet_frames/frame" + ("0000000" + i).slice(-7) +
                ".png";
  }


    /* set a timeout to make sure all the above elements are created before
       the object is initialized. */
    setTimeout(function() {
        animaaf287ee7fcd43509d0ee719649152a1 = new Animation(frames, img_id, slider_id, 16,
                                 loop_select_id);
    }, 0);
  })()