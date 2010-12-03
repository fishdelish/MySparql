var create_table = function(data) {
      if (data.warnings != undefined) {
        var error_string = "<span style='color:red;'>Error:"
        $.each(data.warnings, function(index, error) {
          error_string += "<br/>" + error;
        }); 
        error_string += "</span>"
        return error_string  
      }
      var table = "<table><tr>"
      var order = []
      $.each(data.head.vars, function(index, variable_name) {
        table += "<th>" + variable_name + "</th>"
        order.push(variable_name)
      });
      table += "</tr>"
      $.each(data.results.bindings, function(index, result) {
        table += "<tr>"
        $.each(order, function(index, binding) {
          table += "<td>" + result[binding].value +"</td>"
        });
        table += "</tr>"
      });
      table += "</table>"
      return table;
};

var table_formatter = function(query, data) {
      $(query).replaceWith(create_table(data));
    };

var submit_tutorial_box = function(event, query_id) {
  var url = mysparql_path + '/queries/run'
  var success_func = function(data) {
    $("#" + query_id + " .results").html(create_table(data))
  };

  $("#" + query_id + " .results").html(mysparql_loading)
  $.ajax({type : "POST", data : event.serialize(), dataType : "json", success : success_func, url : url});
  return false;
};

var create_submit_button = function() {
  return $('<input type="submit" value="Run Query" />')
}

var create_label = function() {
  var label = $('<label for="query" />')
  label.text("Query")
  return label;
}

var create_textarea = function(query) {
  var textarea = $('<textarea name="query" style="width:400px;height:100px;" />')
  textarea.val(query)
  return textarea;
}

var create_query_id = function(query_id) {
  return $('<input type="hidden" name="query_id" value="' + query_id + '" />');
}

var create_results_header = function() {
  var header = $('<span/>')
  header.text("Results")
  return header;
}

var create_results_area = function() {
  return $('<div class="results" />')
}

var create_break = function() {
  return $('<br/>')
}

var create_form = function(query_id, data) {
  var form = $('<form id="' + query_id + '" method="post" onsubmit="return submit_tutorial_box($(this), \'' + query_id + '\');" />')
  form.append(create_label());
  form.append(create_break());
  form.append(create_textarea(data["query"]["query"]));
  form.append(create_break());
  form.append(create_query_id(query_id));
  form.append(create_submit_button());
  form.append(create_break());
  form.append(create_results_header());
  form.append(create_break());
  form.append(create_results_area());
  return form;
}

var tutorial_formatter = function(query, data) {
  var query_id = $(query).attr("href")
  var form = create_form(query_id, data);
  $(query).replaceWith(form);
  submit_tutorial_box(form, query_id)
};

$(document).ready(function() {
  $(".mysparql").each(function(index, query) {
    var query_id = $(query).attr("href")
    var query_type = $(query).attr("data-formatter")
    var formatter;
    var url;

    //Determine which formatter to use and set that formatter up
    switch (query_type) {
      case "tutorial":
        formatter = tutorial_formatter;
        url = mysparql_path + "/queries/" + query_id + "?tutorial"
        break;
      case "table":
        formatter = table_formatter;
        url = mysparql_path + "/queries/" + query_id
        break;
      default:
        formatter = table_formatter;
        url = mysparql_path + "/queries/" + query_id
        break;
    };

    //Construct the success callback.
    var success_func = function(data) {
      formatter(query, data);
    };

    var error_func = function() {
      $(query).html("Error")
    }

    //Set up the mysparql link to indicate status and to deactivate clicking the link
    $(query).html(mysparql_loading)
    $(query).click(function() {return false;});
    $.ajax({type: "GET", url: url, success: success_func, dataType: "json", error: error_func});  
  });
});

