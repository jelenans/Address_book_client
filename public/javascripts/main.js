// The root URL for the RESTful services
var rootURL = "localhost:3000/entries";

var currentContact;

 var query = $.param({
  response_type: 'token',
  client_id: '156523700281-aesn8jkatkcu9tvtnb58nbjosrcp27fi.apps.googleusercontent.com',
  redirect_uri: encodeURI('http://localhost:3000/entries/oauth2callback'),
  scope: encodeURI('https://www.google.com/m8/feeds/')
});

// Retrieve contacts list when application starts 
findAll();

// Nothing to delete in initial application state
$('#btnDelete').hide();

// // Register listeners
// $('#btnSearchId').click(function() {
// 	findById($('#searchKey').val());
// 	return false;
// });

$('#btnSearch').click(function() {
	findByAny($('#searchKey').val());
	//getToken();
	return false;
});


$('#btnAuth').click(function() {
	//findByAny($('#searchKey').val());
	window.location = 'https://accounts.google.com/o/oauth2/auth?' + query;
	
	return false;
});

$('#btnSync').click(function() {
	//findByAny($('#searchKey').val());
	var token= findParams();
    getContacts(token);
	return false;
});

$('#btnAdd').click(function() {
	newContact();
	return false;
});

$('#btnSave').click(function() {
	if ($('#contactId').val() == '')
		addContact();
	else
		updateContact();
	return false;
});

$('#btnDelete').click(function() {
	deleteContact();
	return false;
});

$('#contacts a').live('click', function() {
	findById($(this).data('identity'));
});



function getContacts(token) {
//$('#selected').append('omgggggggggg:' +token);
	$.ajax({
	url: 'https://www.google.com/m8/feeds/contacts/default/full',
	dataType: 'json',
	data: { access_token: token, 'max-results': '5', alt: 'json' },
	success:function(data){ 


// #########################################################################################################################################################
 	var num = data.feed["openSearch$totalResults"]["$t"];
 	 
            var addrs = [];
            $(data.feed.entry).each(function() {
                var name = this.title["$t"];
                  //alert('HAAAAAA   '+ name);
                if ("gd$email" in this) {
                    $(this["gd$email"]).each(function() {

                         var nameSurn= name.split(' ');

                          var newItem;
                         if(nameSurn.length==2)
                         {
	                          newItem= JSON.stringify({
								"name": nameSurn[0], 
								"surname": nameSurn[1], 
								"email": this.address, 
								"phone": "0652277654"
								});
                         }
                         else
                         {
                         	var nameSurn= this.address.split('@');
                         	newItem= JSON.stringify({
							"name": nameSurn[0], 
							"surname": '', 
							"email": this.address, 
							"phone": "0652277654"
							});
                         }
                         $.ajax({
							type: 'POST',
							contentType: 'application/json',
							url: rootURL,
							dataType: "json",
							data: newItem,
							success: function(data){},
							error: function(jqXHR, textStatus, errorThrown){
								alert('sync error: ' + textStatus);
							}
						});

                    
                   });
                }
                    });

					findAll();
               
               }


	});
}


function findParams() {
  
  if (window.location.hash) {
  	
    var params = (window.location.hash.substr(1)).split("&");

   

    var res;

    for (i = 0; i < params.length; i++)
    {
    	
        var a = params[i].split("=");
        res= a[1];
      
        // Now every parameter from the hash is beind handled this way
        if (a[0] == "access_token")
        {
            res= a[1];
            break;
        }

    }
  }



  return res;
}

function newContact() {
	$('#btnDelete').hide();
	currentContact = {};
	renderDetails(currentContact); // Display empty form
}

function findAll() {
	console.log('findAll');
	$.ajax({
		type: 'GET',
		url: rootURL,
		dataType: "json", // data type of response
		success: renderList
	});
}

function findByAny(searchKey) {
	$.ajax({
		type: 'GET',
		url: rootURL + '/find/' + searchKey,
		dataType: "json",
		success: renderList
	});
}

function findById(id) {
	$.ajax({
		type: 'GET',
		url: rootURL + '/' + id,
		dataType: "json",
		success: function(data){
			$('#btnDelete').show();
			console.log('findById success: ' + data.name);
			currentContact = data;
			renderDetails(currentContact);
		}
	});
}

function addContact() {
	console.log('addContact');
	$.ajax({
		type: 'POST',
		contentType: 'application/json',
		url: rootURL,
		dataType: "json",
		data: formToJSON(),
		success: findAll,
		error: function(jqXHR, textStatus, errorThrown){
			alert('addContact error: ' + textStatus);
		}
	});
}

function updateContact() {
	console.log('updateContact');
	$.ajax({
		type: 'PUT',
		contentType: 'application/json',
		url: rootURL + '/' + $('#contactId').val(),
		dataType: "json",
		data: formToJSON(),
		success: findAll,
		error: function(jqXHR, textStatus, errorThrown){
			alert('updateContact error: ' + textStatus);
		}
	});
}

function deleteContact() {
	console.log('deleteContact');
	$.ajax({
		type: 'DELETE',
		url: rootURL + '/' + $('#contactId').val(),
		success: findAll,
		error: function(jqXHR, textStatus, errorThrown){
			alert('deleteContact error');
		}
	});
}

function renderList(data) {
	// JAX-RS serializes an empty list as null, and a 'collection of one' as an object (not an 'array of one')
	var list = data == null ? [] : (data instanceof Array ? data : [data]);

	$('#contacts li').remove();
	$.each(list, function(index, contact) {
		$('#contacts').append('<li><a href="#" class="list-group-item" data-identity="' + contact._id + '">'+contact.name+' '+contact.surname+'</a></li>');
	});
}

function renderDetails(contact) {
	$('#selected').empty();
	 // if (contact.name != null && contact.surname !=null)
		// $('#selected').append(contact.name+' '+contact.surname);
	$('#contactId').val(contact._id);
	$('#name').val(contact.name);
	$('#surname').val(contact.surname);
	$('#email').val(contact.email);
	$('#phone').val(contact.phone);
}

// Helper function to serialize all the form fields into a JSON string
function formToJSON() {
	return JSON.stringify({
		"id": $('#contactId').val(), 
		"name": $('#name').val(), 
		"surname": $('#surname').val(), 
		"email": $('#email').val(), 
		"phone": $('#phone').val()
		});
}
