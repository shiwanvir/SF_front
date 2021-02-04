(function(){//closure
	
	var BASE_URL = '';
	var DOC_ID = 0;
	var ATTACHMENTS = [];
	var SAVE_STATUS = '';
	var DOC_TEMPLATE = 0;	
	var PERMISSIONS = {};
	var SET_AS_MAIN = "NO";
	
//document ready event
$(document).ready(function(){	
		
	//set global variable data
	BASE_URL = $('#base_url').val();
	DOC_ID = $('#ds-doc-id').val();
	SAVE_STATUS = $('#ds-save-status').val();
	DOC_TEMPLATE = $('#ds-doc-template').val();
	SET_AS_MAIN = $('#set-as-main').val();
	PERMISSIONS = {
		'DOC_ATH_LIST' : $('#doc-ath-list').val(),
		'DOC_ATH_UPLD' : $('#doc-ath-upld').val(),
		'DOC_ATH_VIEW' : $('#doc-ath-view').val(),
		'DOC_ATH_DEL' : $('#doc-ath-del').val(),
		'DOC_HIS_LIST' : $('#doc-his-list').val(),
		'DOC_HIS_DEL' : $('#doc-his-list').val(),
		'DOC_EDIT' : $('#doc-edit').val()
	};
	
	$('title').html('DMS | Document - ' + DOC_ID);// set page title
	
	//initialize input fields as date fields with boostrap datepicker plugin
	$('.date').datepicker({
	    format: 'yyyy-mm-dd'        
	});
	
	initialize_main_fields();//initialize main fields validation
	
	initialize_index_fields(); // initialize index fields validation
	
	initilize_attachment_table(); //initialize attachment table	
	
	initialize_file_uploader(); //initialize attachment upload plugin

	load_history_table();
	
});


//open new document with currently selected template
$('#ds-new-doc').click(function(){
	$.alert.open({
        type : 'confirm',
        title : 'New Document',
        content : 'Do you want to create new document? If you continue all unsaved data will be lost.',
        icon : 'warning',
        callback : function(button) {
        	if (button == 'yes')            {
        		window.open("document-new?template=" + DOC_TEMPLATE,"_self");
            }
        }
	});
});


//grid button click events
$('#attachments-list').on('click','button',function(){
	var ele = $(this);
	var type = ele.attr('data-btn');
	if(type === 'open')
		open_file(this);
	else if(type === 'delete')
		delete_attachment(this);
	else if(type === 'change')
		change_attachment_default_status(this);
})



//document save btn event to save document
$('#ds-btn-save').click(function(){
	
	var data = $('#ds-doc-form').form_validator('validate');//validate data fields and get data object
	var indexData = $('#ds-index-list').form_validator('validate');// validate indexes values
	if(data != false && indexData != false)
	{
		run_waitMe('Saving...');
		
		data['docId'] = DOC_ID;//set document id
		data['docIndexes'] = indexData;	
		
		//remove null values
		for(var key in indexData) {
			if(indexData[key] == null)
				indexData[key] = '';
		}
		
		var saveUrl = "document-save";
		if(SAVE_STATUS == 'EDIT')
			saveUrl = "document-update";
		
		//make an ajax reques to save document details
		makeAjaxRequest({
			url : saveUrl,
			type : 'post',
			async : false,
			data : JSON.stringify(data),
			success : function(response){
				try	{
					setTimeout(function(){
						
						waitMe_hide();//hide saving animation
						
						if(response['status'] != undefined && response['status'] == 'success')
						{
							$.alert.open({
	                            type : 'info',
	                            title : 'Save Document Details',
	                            content : response['message'],
	                            callback : function(button) {
	                            	if(SAVE_STATUS == 'NEW')
	                            		window.open('document-open?docId=' + response['docId'] + "&template=" + response['template'],'_self');
	                            	else
	                            		location.reload();
	                            }
	                        });							
						}
						else
						{
							$.alert.open({
	                            type : 'error',
	                            title : 'Save Document : ERROR',
	                            content : response['message']
	                        });
						}
					}, 1500);					
				}
				catch(e){
					alert(e);
					console.log(e);
				}
			}
		});	
	}	
});


function initialize_main_fields(){
	//initialize form validation plugin
	$('#ds-doc-form').form_validator({
        events : ['blur'],
        fields : {
            'ds-doc-name' : {
                key : 'docName',
                notEmpty : {
                    message : 'Document name field cannot be empty'
                },
                regExp : {
                	regExp : /^\s*[a-z-._\d,\s]+\s*$/i,
                	message : 'You cannot include special characters like \ / : * ? \" < > |'
                },
                remote : {
                    url : 'is-document-name-exists',
                    data : {
                    	'docName': function(){ return $('#ds-doc-name').val(); } , 
                    	'docId' : function(){return parseInt(DOC_ID)},
                    	'docTemplate' : function(){return parseInt(DOC_TEMPLATE)}
                    }
                }
            },
            'ds-doc-description' : {
                key : 'docDescription',
                notRequired : true
            },
            'ds-template' : {
                key : 'template',
                notEmpty : {
                    message : 'Document template field cannot be empty'
                }
            },
            'ds-box-no' : {
                key : 'boxNo',
                notEmpty : {
                    message : 'Document box number field cannot be empty'
                }
            }
        }
    });
}


//initialize file uploade plugin
function initialize_file_uploader()
{
	if(PERMISSIONS['DOC_ATH_UPLD'] == 'true') {
		$('#filer_input').filer({
			//limit: 3,
			maxSize: 50,
			//extensions: ['jpg', 'jpeg', 'png', 'gif'],
			changeInput: true,
			showThumbs: true,
			addMore: false,
			dragDrop: {
				dragEnter: null,
				dragLeave: null,
				drop: null,
			},
			uploadFile: {
				url: "document-attachments-upload",
				data: {
					'documentId' : DOC_ID,
					'template' : DOC_TEMPLATE
				},
				type: 'POST',
				enctype: 'multipart/form-data',
				beforeSend: function(){},
				success: function(data, el){
					//alert('success');
					/*var filerKit = $("#filer_input").prop("jFiler");
					filerKit.reset();    */ 
					console.log('One File Success ' + data);
				},
				error: function(el){
					alert('error');
				},
				onProgress : function(a,b){
					console.log('onProgress' + a);
				},
				onComplete : function(a,b,c){
					setTimeout(function(){
						var filerKit = $("#filer_input").prop("jFiler");
						filerKit.reset();
						//check 'attachment list' permission
						//if(HAS_PERMISSION(PERMISSIONS,'attachment_list'))
						//{
							load_attachments();
							reload_attachments_table();
						//}                    
					}, 1500);
					console.log('oncomplete ' + a);
				}
			}
		});
	}
}


function open_file(element)
{
	var attach_id = element.getAttribute('data-id');//.attr('data-id');	
	window.open('document-show?docId='+attach_id+'&type=attachment&template='+DOC_TEMPLATE,'_blank');
}


//get attachments list
function load_attachments()
{
	makeAjaxRequest({
		url : 'document-attachments-list',
		type : 'POST',
		async : false,
		data : JSON.stringify({
			'documentId' : parseInt(DOC_ID)
		}),
		success : function(response){ //response automatically converted to js object
			console.log(response);//print server response
			try
			{					
				if(response != undefined && response != null) {
					ATTACHMENTS = response;						
				}
				else {
					ATTACHMENTS = [];	
				}
			}
			catch(e){
				ATTACHMENTS = [];
				console.log(e);
				alert(e);
			}				
		}
	});	
}


function load_history_table()
{
	if(PERMISSIONS['DOC_HIS_LIST'] == 'true'){		
	
		var tbl = $('#document-history').DataTable( {
        "scrollY": "500px",
        "scrollX": true,
        "scrollCollapse": true,
        //responsive: true,
        "searching": false,
        "processing": true,
        "serverSide": true,
        "select": true,
        "ajax": {
            "url": "document-history-list",
            "type": "POST",
            "data" : {          	
            	'docId' : DOC_ID
            }
        },
        "columns": [
             { "data": "history_id" },
             { 
            	 "data": "status",
            	 "render": function ( data, type, full, meta ){
            		 return "<span>" + data.toUpperCase() + "</span>";
            	 }
             },
             { "data": "activity_date" },
             { "data": "email" }
        ]
		} );
		tbl.draw(false);
	}
}


$(document).on('shown.bs.tab', 'a[data-toggle="tab"]', function (e) {
	if($(this).html() == 'History')
		$('#document-history').DataTable().draw(false);
});

/*$('#tab-history').change(function(){
	$('#document-history').DataTable().page( 'next' ).draw( 'page' );
});*/

//reload attachments list


function initilize_attachment_table(){
	//check 'attachment list' permission
	if(PERMISSIONS['DOC_ATH_LIST'] == 'true')
	{
		var columns = [
            { "data": "attachmentId" , 'width' : '5%'},
            { "data": "attachmentName" , 'width' : '85%'}, 
            { 
            	"data": "defaultStatus",
            	"render": function ( data, type, full, meta ){   
            		if(data == true)
            			return '<span style="color:red;font-weight:bold">YES</span>'; 
            		else
            			return '<span style="color:green;font-weight:bold">NO</span>'; 
                }
            }, 
		];
		
		if(PERMISSIONS['DOC_ATH_VIEW'] == 'true'){
			columns.push({
                "orderable": false,
                'data' : 'attachmentId',
                'width' : '1%',
                "render": function ( data, type, full, meta ){                	
					return '<button class="btn btn-default btn-flat btn-sm" data-btn="open" data-id="'+data+'">Open File</button>';                	
                }
            });
		}
		
		if(PERMISSIONS['DOC_EDIT'] == 'true' && SET_AS_MAIN == 'YES'){
			columns.push({
                "orderable": false,
                'data' : 'attachmentId',
                'width' : '1%',
                "render": function ( data, type, full, meta ){   
                	if(full['defaultStatus'] == false)
                		return '<button class="btn btn-primary btn-flat btn-sm" data-btn="change" data-id="'+data+'">Set As Main</button>';                	
                	else
                		return '<button class="btn btn-primary btn-flat btn-sm" disabled="disableed">Set As Main</button>';
                }
            });
		}
		
		if(PERMISSIONS['DOC_ATH_DEL'] == 'true'){
			columns.push({
                "orderable": false,
                'data' : 'attachmentId',
                'width' : '1%',
                render : function(data, type, full, meta){                 	
					return '<button class="btn btn-danger btn-flat btn-sm" data-btn="delete" data-id="'+data+'">Delete</button>';               		
                }
            });
		}
		
		load_attachments();
	     
	    $('#attachments-list').DataTable( {
	        //"scrollY": "500px",
	        //"scrollCollapse": true,        
	        "data" : ATTACHMENTS,
	        "columns": columns
	    } );
	}
}


function initialize_index_fields(){
	var fields = {};
	
	var index_inputs = $('#ds-index-list .index');
	index_inputs.each(function(){
		
		var ele = $(this);
		var index_type = ele.attr('data-type');
		var index_name = ele.attr('data-index-name');
		var compulsory = ele.attr('data-compulsory');
		var id = ele.attr('id');
		
		var field = { key : index_name };
		
		if(compulsory == 'YES')
			field['notEmpty'] = {message : 'Field cannot be empty.'};	
		else
			field['notRequired'] = true;
		
		if(index_type == 'TEXT'){
			
		}
		else if(index_type == 'INTEGER'){
			field['type'] = {
			    'type' : 'integer',
			    'message' : 'Incorrect integer value'
			};
		}
		else if(index_type == 'DECIMAL'){
			field['type'] = {
				'type' : 'decimal',
				'message' : 'Incorrect decimal value'
			};
		}
		else if(index_type == 'DATE'){
			field['type'] = {
				'type' : 'date',
				'format' : 'yyyy-mm-dd',
				'message' : 'Incorrect date value'
			};
		}
		else if(index_type == 'SELECT'){			
		}
		else if(index_type == 'AUTO COMPLETE'){	
			
			var index_id = ele.attr('data-id');
			var common_data_group = ele.attr('data-group');
			
			$("#" + id).select2({
			  ajax: {
				    url: "document-searched-index-data",
				    dataType: 'json',
				    delay: 300,
				    data: function (params) {
				      return {
				        searchText: params.term, // search term
				        page: params.page,
				        'index_id' : index_id,
				        'common_data_group' : common_data_group,
				      };
				    },
				    processResults: function (data, params) {			 
				      params.page = params.page || 1;
				      return {
				        results: data.items,
				        pagination: {
				          more: (params.page * 30) < data.total_count
				        }
				      };
				    },
				    cache: true
				  },
				  escapeMarkup: function (markup) { return markup; }, // let our custom formatter work
				  minimumInputLength: 1
				});			
		}		
		fields[id] = field;
	});	
	
	//initialize form validation plugin
	$('#ds-index-list').form_validator({
        events : ['blur'],
        fields : fields
    });
	
}


function reload_attachments_table()
{
  var tbl = $('#attachments-list').dataTable();
  tbl.fnClearTable();
  tbl.fnDraw();
  if(ATTACHMENTS != null && ATTACHMENTS.length != 0)
      tbl.fnAddData(ATTACHMENTS);
}



function load_document_details()
{
	makeAjaxRequest({
		url : 'get-document-details',
		type : 'POST',
		async : false,
		data : JSON.stringify({
			'documentId' : DOC_ID,
			'documentTemplate' : DOC_TEMPLATE
		}),
		success : function(response){ //response automatically converted to js object
			console.log(response);//print server response
			try
			{					
				if(response != undefined && response != null)
				{
					jsSetFormData([
				        /*{'id' : 'ds-doc-name' , value : response['docName']},
				        {'id' : 'ds-doc-description' , value : response['docDescription']},
				        {'id' : 'ds-template' , value : response['template']['tmpId']},
				        {'id' : 'ds-box-no' , value : response['boxNo']}*/
				        {'id' : 'ds-doc-name' , value : response['doc_name']},
				        {'id' : 'ds-doc-description' , value : response['doc_description']},
				        {'id' : 'ds-template' , value : response['doc_template']},
				        {'id' : 'ds-box-no' , value : response['box_no']},
				        {'id' : 'ds-created-date' , value : CONVERT_DATE_OBJECT_TO_TEXT(new Date(response['created_timestamp']))},
				        {'id' : 'ds-updated-date' , value : CONVERT_DATE_OBJECT_TO_TEXT(new Date(response['last_update_timestamp']))},
				        {'id' : 'ds-doc-type' , value : response['doc_type']},
				        {'id' : 'ds-doc-size' , value : response['doc_size']+" KB"},
				        {'id' : 'ds-user-name' , value : response['full_name']}
					]);	
					
					//$('#ds-template').val( response['template']['tmpId']);
					$('#ds-template').trigger( "change" );					
					
					
					var tds = $('#ds-index-list :input');
					var docRowCount = 0;
					tds.each(function(){
						var ele = $(this);
						var indexId = ele.attr('data-index-id');
						ele.val(response['indexes']['index_'+indexId]);
						/*for(var x = 0 ; x < response['documentIndexes'].length ; x++)
						{
							if(response['documentIndexes'][x]['indexId'] == indexId)
							{
								ele.val(response['documentIndexes'][x]['indexValue']);
								break;
							}								
						}*/
						
					});
				}				
			}
			catch(e){
				ATTACHMENTS = [];	
				console.log(e);
				alert(e);
			}				
		}
	});	
}


function delete_attachment(element)
{
	var attach_id = element.getAttribute('data-id');
	$.alert.open({
		type : 'confirm',
		title : 'Delete Attachment',
		content : 'Do you want to delete attachment ' + attach_id + '?',
		icon : 'warning',
		callback : function(button) {	  
			if (button == 'yes')
			{					
				makeAjaxRequest({
					url : 'document-attachment-delete',
					type : 'GET',
					async : false,
					data : {
						'attachmentId' : attach_id
					},
					success : function(response){
						try{
							if(response['status'] == 'success')
							{
								$.alert.open({
	                            type : 'info',
	                            title : 'Delete Attachment',
	                            content : response['message']
	                        });	
								load_attachments();
								reload_attachments_table();
							}
							else
								alert(response['message']);
						}
						catch(e){
							alert(e);
						}
					}
				});
			}
		}
	});
}


function change_attachment_default_status(element)
{
	var attach_id = element.getAttribute('data-id');
	$.alert.open({
		type : 'confirm',
		title : 'Change Attachment Default Status',
		content : 'Do you want to set attachment ' + attach_id + ' as main document?',
		icon : 'warning',
		callback : function(button) {	  
			if (button == 'yes')
			{					
				makeAjaxRequest({
					url : 'document-attachment-change',
					type : 'GET',
					async : false,
					data : {
						'attachmentId' : attach_id,
						'documentId' : DOC_ID
					},
					success : function(response){
						try{
							if(response['status'] == 'success')
							{
								$.alert.open({
	                            type : 'info',
	                            title : 'Change Attachment Default Status',
	                            content : response['message'],
	                            callback : function(button){
	                            	location.reload();
	                            }
	                        });	
								//load_attachments();
								//reload_attachments_table();
							}
							else
								alert(response['message']);
						}
						catch(e){
							alert(e);
						}
					}
				});
			}
		}
	});
}


})();//end of closure