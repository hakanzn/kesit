src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
let dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);

let cap = new cv.VideoCapture(video);
rect = new cv.Rect(video.width/3, 0, video.width/3, video.height);
resim=document.getElementById("resim");

siyah_hat=true;
dur = false;
FPS = 5;
cizildi=true;
ilkresim=false;
ekranx=0;
ekrany=0;
resimaci=0;
cnt=null;
aci=0;
yukseklik=0;
genislik=0;
merkez_nokta=null;


fark=[canvasout.offsetLeft,canvasout.offsetTop,canvasout.offsetLeft+video.width,canvasout.offsetTop+video.height];

function rect_ciz(btn){
	  navigator.vibrate(50);
	  if(btn.innerText=="Rect Çiz"){
	  	  btn.innerText="Geri Al";
	  	  btn.style.backgroundColor="red";
	  	}
	  	else{
	  		 btn.innerText="Rect Çiz";
	  		 btn.style.backgroundColor="#4CAF50";
	  		 rect = new cv.Rect(video.width/3, 0, video.width/3, video.height);
	  		 return;
	  	}
   canvasout.addEventListener("touchstart", dokun_basla);
   canvasout.addEventListener("touchend", dokun_bit);
   canvasout.addEventListener("touchcancel", dokun_iptal);
}

function rect_ciz_iptal(){
   canvasout.removeEventListener("touchstart", dokun_basla);
   canvasout.removeEventListener("touchend", dokun_bit);
   canvasout.removeEventListener("touchcancel", dokun_iptal);
}
function dokun_basla(e){
	  document.getElementsByTagName("body")[0].style.overflowY="hidden";
   document.getElementsByTagName("body")[0].style.height="%100";
   ekranx=e.touches[0].clientX-fark[0];
   //bilgi.innerHTML+=ekranx;
   ekrany=e.touches[0].clientY-fark[1];
   
}
function dokun_bit(e){
	  yekranx=e.changedTouches[0].clientX;
	  yekrany=e.changedTouches[0].clientY;
	  if((yekranx-fark[0]>ekranx && yekrany-fark[1]>ekrany) && ((yekranx-fark[0])<fark[2] && (yekrany-fark[1])<fark[3])){
	      delete rect;
      try{
        rect=new cv.Rect(ekranx,ekrany,(yekranx-fark[0])-ekranx,(yekrany-fark[1])-ekrany);
        cv.rectangle(dst, new cv.Point(rect.x,rect.y), new cv.Point(rect.x+rect.width,rect.y+rect.height), new cv.Scalar(0,255,0,255), 2, 8, 0);
        //cv.imshow('canvasout', dst);
      }catch(e){
   	     alert(e+"rectangle cizme hatasi");
   	  }
   }
   document.getElementsByTagName("body")[0].style.overflowY="auto";
   //rect_ciz_iptal();
}

function dokun_iptal(e){
   bilgi.innerHTML=(e);
}
function min_rect(rdst,cnt){
	   
    let rotatedRect = cv.minAreaRect(cnt);
    aci=rotatedRect.angle;
    gen=rotatedRect.size.width;
    yuk=rotatedRect.size.height;
    if(gen>yuk){
      genislik=yuk;
      yukseklik=gen;
    }
    else{
      genislik=gen;
      yukseklik=yuk;
    }
    let vertices = cv.RotatedRect.points(rotatedRect);
    let rectangleColor = new cv.Scalar(255, 255, 0);
    //alert(cv.fitEllipse(cnt).angle);
    for (let i = 0; i < 4; i++) {
       cv.line(rdst, vertices[i], vertices[(i + 1) % 4], rectangleColor, 1, cv.LINE_8, 0);
    }
    //vertices.delete(); rotatedRect.delete();
}  

function merkez(cnt){
   let M = cv.moments(cnt, false);
   let cx = M.m10/M.m00;
   let cy = M.m01/M.m00;
   return [cx,cy];
}
function bulaniklik(src,dst,en,boy){
    let ksize = new cv.Size(en, boy);
    let anchor = new cv.Point(-1, -1);
    cv.blur(src, dst, ksize, anchor, cv.BORDER_DEFAULT);
    //cv.boxFilter(src, dst, -1, ksize, anchor, true, cv.BORDER_DEFAULT)
}
function erozyon(src,dst,tekrar){
    let M = cv.Mat.ones(2, 2, cv.CV_8U);
    let anchor = new cv.Point(-1, -1);
    cv.erode(src, dst, M, anchor, tekrar, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
    M.delete();
}
function dilatasyon(src,dst,tekrar){
    let M = cv.Mat.ones(2, 2, cv.CV_8U);
    let anchor = new cv.Point(-1, -1);
    cv.dilate(src, dst, M, anchor, tekrar, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
    M.delete();
}

function kenar(src){
 	   dst2 = cv.Mat.zeros(src.cols, src.rows, cv.CV_8UC3);
    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
    //cv.threshold(src,src,minth,255,siyah_hat ? cv.THRESH_BINARY_INV : cv.THRESH_BINARY);
    let low = new cv.Mat(src.rows, src.cols, src.type(), [minth, minth, minth, 0]);
    let high = new cv.Mat(src.rows, src.cols, src.type(), [maxth, maxth, maxth, 255]);
    cv.inRange(src, low, high, src);
    if(parseInt(erode.value)>0){
    	   erozyon(src,src,parseInt(erode.value));
    }
    if(parseInt(dilate.value)>0){
       dilatasyon(src,src,parseInt(dilate.value));
    }
    if(parseInt(smooth.value)>0){
       bulaniklik(src,src,parseInt(smooth.value),parseInt(smooth.value));
    }
    //konturleri bul
    contours = new cv.MatVector();
    hierarchy = new cv.Mat();
    cv.findContours(src, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    kontur_sayi=contours.size();
    //kontur yoksa dön
    if(kontur_sayi==0){
    	   return;
    }
    // sablon alma butonuna basildiysa
    if(cizildi==false){
    	   cizildi=true;
    	   for (let j = 0; j < kontur_sayi; ++j) {
            color3 = new cv.Scalar(0,255,0,255);
            cv.drawContours(dst2, contours, j, color3, 1, cv.LINE_AA, hierarchy, 100);
            if(merkez_nokta!=null){
                cv.line(dst2, merkez_nokta, merkez_nokta, new cv.Scalar(0,0,255,255), 5, cv.LINE_8, 0);
                min_rect(dst2,contours.get(cnt));   
            }
        }
        ilkresim = dst2.clone();
        mask = new cv.Mat();
        dtype = -1;
        resimaci = aci;
        ilk_merkez_nokta = merkez_nokta;
    }
    
    // basilmadiysa
    else{
    	
        for (let i = 0; i < kontur_sayi; ++i) {
            color2 = new cv.Scalar(255,0,0,255);
            cv.drawContours(dst2, contours, i, color2, 1, cv.LINE_AA, hierarchy, 100);
        }
    }
    //eger sablon alindiysa onu da ciz
    //en buyuk konturu, merkezini ve acisini bul
    enbuyuk=0;
    
    if(kontur_sayi<5){
       for(y=0;y<kontur_sayi;++y){
       	   alan=cv.contourArea(contours.get(y),false);
       	   if(alan>enbuyuk){ 
       	   	   rect_buyuk = cv.minAreaRect(contours.get(y));
       	   	   //bilgi.innerHTML=rect_buyuk.size.width;
       	   	   if(rect_buyuk.size.width==src.cols-1){
       	   	   	   continue;
       	   	   	}
       	  	    enbuyuk=alan;
       	  	    cnt=y;
       	  	    aci=rect_buyuk.angle;
       	  	    merkezxy=merkez(contours.get(cnt));
       	  	    merkez_nokta=new cv.Point(merkezxy[0],merkezxy[1]);
       	  	 }
       }
       if(enbuyuk<200){
       	  return;
       	}       	         	
       	// en dar diktortgeni ciz
       	min_rect(dst2,contours.get(cnt));   
    }
    if(ilkresim){
    	   try{
    	   	     /*
    	   	   	  dondur=resimaci>aci? resimaci-aci:aci-resimaci;
             let dsize = new cv.Size(ilkresim.rows, ilkresim.cols);
             let center = new cv.Point(ilkresim.cols / 2, ilkresim.rows / 2);
             let M = cv.getRotationMatrix2D(center, dondur, 1);
             cv.warpAffine(dst2, dst2, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());
             //M.delete(); dsize.delete();center.delete();
             */
    	   	     cv.add(ilkresim, dst2, dst2, mask, dtype);
    	   }catch(e){navigator.vibrate(50);}
    }
    //merkez nokta ciz
    if(merkez_nokta!=null){
        cv.line(dst2, merkez_nokta, merkez_nokta, new cv.Scalar(255,255,255,255), 5, cv.LINE_8, 0);
    }
    //resmi goster
    //yaz(dst2,1,kontur_sayi.toString());
    yaz(dst2, 1, "Genislik: " +genislik.toFixed(2)+"px");
    yaz(dst2, 2, "Yukseklik: " +yukseklik.toFixed(2)+"px");
    yaz(dst2, 3, "Aci: " +aci.toFixed(2));
 
    cv.imshow('canvasout', dst2);
    //hafiza bosalt. insallah olur
    dst2.delete();   contours.delete(); hierarchy.delete();
}
function hafiza(){
    hfz=window.performance.memory;
    str="Hfz: " + (parseInt(hfz["usedJSHeapSize"])/(1024*1024)).toFixed(2) + "/" + (parseInt(hfz["jsHeapSizeLimit"])/(1024*1024)).toFixed(2)+" MB";
    return str;
}
function yaz(dst,satir,yazi){
	  	yeni_satir=12;
   yeni_satir*=satir;
   var font = cv.FONT_HERSHEY_PLAIN ;
   cv.putText(dst,yazi,new cv.Point(0,yeni_satir), font, 1,new cv.Scalar(255,255,255,255),1,cv.LINE_4);
}

function drawCanvas(canvas, img) {
  canvas.width = getComputedStyle(canvas).width.split('px')[0];
  canvas.height = getComputedStyle(canvas).height.split('px')[0];
  ratio  = Math.min(canvas.width / img.width, canvas.height / img.height);
  x = (canvas.width - img.width * ratio) / 2;
  y = (canvas.height - img.height * ratio) / 2;
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height,
      x, y, img.width * ratio, img.height * ratio);
}
function dene(){
   imageCapture=new ImageCapture(hv);
   imageCapture.takePhoto({fillLightMode:'flash'})
  .then(blob => createImageBitmap(blob))
  .then(imageBitmap => {
    canvas = document.querySelector('#canvasout');
    drawCanvas(canvas, imageBitmap);
  })
  .catch(error => console.log(error));

}
function processVideo() {    
	       if(typeof(rect)=="undefined"){
	       	   setTimeout(processVideo,1000);
	       	}
	       	
        let begin = Date.now();
        let color = new cv.Scalar(255,0,0,255); 
        cap.read(src);
        src.copyTo(dst);
        kenar(dst);
        let delay = 1000/FPS - (Date.now() - begin);
        //for(i in sil){i.delete()}
        setTimeout(processVideo, delay);
        
    
};

setTimeout(processVideo, 0);

      window.addEventListener('error', function(error) {
        if (ChromeSamples && ChromeSamples.setStatus) {
          console.error(error);
          ChromeSamples.setStatus(error.message + ' (Your browser may not support this feature.)');
          error.preventDefault();
        }
      });
var ChromeSamples = {
    log: function() {
      var line = Array.prototype.slice.call(arguments).map(function(argument) {
        return typeof argument === 'string' ? argument : JSON.stringify(argument);
      }).join(' ');

      document.querySelector('#log').textContent += line + '\n';
    },

    clearLog: function() {
      document.querySelector('#log').textContent = '';
    },

    setStatus: function(status) {
      document.querySelector('#status').textContent = status;
    },

    setContent: function(newContent) {
      var content = document.querySelector('#content');
      while(content.hasChildNodes()) {
        content.removeChild(content.lastChild);
      }
      content.appendChild(newContent);
    }
  };
