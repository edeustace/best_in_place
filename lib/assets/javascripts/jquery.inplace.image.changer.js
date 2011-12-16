(function(){
//fix for chrome sendAsBinary
if(!XMLHttpRequest.prototype.sendAsBinary){
  XMLHttpRequest.prototype.sendAsBinary = function(datastr) {
    function byteValue(x) {
      return x.charCodeAt(0) & 0xff;
    }
    var ords = Array.prototype.map.call(datastr, byteValue);
    var ui8a = new Uint8Array(ords);
    this.send(ui8a.buffer);
  }
}

})();

window.com || (window.com = {});
com.ee || (com.ee = {});

com.ee.InplaceImageChanger = (function(){
  function InplaceImageChanger(e, options)
  {
    this.$element = jQuery(e);

    var defaultOptions = {
      jsonResponseUrlKey : "url"
    }

    if( options == null ) 
    {
      this.options = defaultOptions;
    }
    else
    {
      this.options = $.extend(defaultOptions, options);
    }

    this.dashdash = '--';
    this.crlf = '\r\n';

    console.log("com.ee.InplaceImageChanger: element: " + this.$element);
    console.log("com.ee.InplaceImageChanger: options: " + this.options);

    this._createImageTag(this.$element.attr('data-original-content'));
    this._createFileInput();
  }
  return InplaceImageChanger;
})();
  


com.ee.InplaceImageChanger.prototype = {

  //default upload complete callback
  uploadCompleted : function( $element, resultText )
  {
    var resultObject = jQuery.parseJSON(resultText);
    this._createImageTag( resultObject[this.options.jsonResponseUrlKey]);
    this._createFileInput();
    if( typeof( this.options.uploadCompleted ) == "function")
    {
      this.options.uploadCompleted($element, resultText);
    }
  },
  _createImageTag : function(url)
  {
    var imageTag = '<img style="cursor:pointer;" src="'+ url +'"/>'
    this.$element.html(imageTag);

    this.$element.find('img').bind('click', {uploader:this}, this._onImageClick);
  },
  _onImageClick : function(evt)
  {
    evt.data.uploader.$element.find('input').trigger('click'); 
  },
  _createFileInput : function()
  {
    var fileInput = '<br/><input style="visibility: hidden; width: 1px; height: 1px;" type="file" name="'+this.$element.attr('data-form-name')+'"></input>';
    this.$element.append(fileInput);
    this.$element.find('input').bind('change', {uploader : this}, this._handleFileSelect);
  },
  _handleFileSelect : function(evt) {
    var files = evt.target.files; // FileList object

    // files is a FileList of File objects. List some properties.
    var output = [];
    var f = evt.target.files[0];
    var info = [f.name, f.type, f.size, f.lastModifiedDate.toLocaleDateString() ].join(',');
    console.log( info );

    var reader = new FileReader();
    var uploader = evt.data.uploader;
    reader.onloadend = function(evt){ 
      uploader._onLocalFileLoadEnd.call(uploader, evt, f);
    };
    reader.readAsBinaryString(f);
  }, 
  _onLocalFileLoadEnd: function(evt, file)
  {
    var xhr = new XMLHttpRequest();
    var upload = xhr.upload;
    var index = 0;
    var start_time = new Date().getTime();
    var boundary = '------multipartformboundary' + (new Date).getTime();
    var builder;

    builder = this.buildMultipartFormBody(file.name, evt.target.result, boundary);

    xhr.open("POST", this.$element.attr('data-url'), true);
    xhr.setRequestHeader('content-type', 'multipart/form-data; boundary=' + boundary);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.sendAsBinary(builder);  
    var uploader = this;
    xhr.onload = function(){
        uploader.uploadCompleted.call(uploader,uploader.$element,xhr.responseText);
    };
  },
  buildMultipartFormBody : function(filename, filedata, boundary) {
    var output = '';

    var uploader = this;
    $.each( this.options.data, function(i, val) {
      if (typeof val === 'function') val = val();
      output += uploader.buildFormSegment(i, val, boundary);
    });
    
    var formName = this.$element.attr('data-form-name');
    output += uploader.buildFileFormSegment( formName, filename, filedata, boundary);
   
    //end
    output += this.dashdash;
    output += boundary;
    output += this.dashdash;
    output += this.crlf;
    return output;
  },
  buildFormSegment : function(key, value, boundary)
  {
    var contentDisposition =  'Content-Disposition: form-data; name="'+ key +'"';
    return this._buildFormSegment( contentDisposition, value, boundary);
  },
  buildFileFormSegment : function( formName, fileName, binaryData, boundary)
  {
    var contentDisposition = 'Content-Disposition: form-data; name="'+ formName +'"; filename="' + fileName + '"';
    contentDisposition += this.crlf;
    contentDisposition += 'Content-Type: application/octet-stream';
    return this._buildFormSegment( contentDisposition, binaryData, boundary );
  },
  _buildFormSegment : function( contentDisposition, value, boundary )
  {
    var output = '';
    output += this.dashdash
    output += boundary;
    output += this.crlf;
    output += contentDisposition;
    output += this.crlf;
    output += this.crlf;
    output += value;
    output += this.crlf;
    return output;
  }
}

console.log("registering with jquery");
jQuery.fn.inplaceImageChanger = function(options) {
  this.each(function(index){
    //console.log( "each.. : " + this + " " + options  + ", " + index);
    if (!jQuery(this).data('com_ee_inplaceImageChanger')) {
      jQuery(this).data('com_ee_inplaceImageChanger', new com.ee.InplaceImageChanger(this, options));
    }
  });
  return this;
};

