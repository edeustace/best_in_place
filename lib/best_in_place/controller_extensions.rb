module BestInPlace
  module ControllerExtensions
    def respond_with_bip(obj)
      obj.changed? ? respond_bip_error(obj) : respond_bip_ok(obj)
    end

  private
    def respond_bip_ok(obj)

      #debugger

      klass = obj.class.to_s
      updating_attr = params[klass.underscore].keys.first

      if renderer = BestInPlace::DisplayMethods.lookup(klass, updating_attr)
        render :json => {:display_as => obj.send(renderer)}.to_json
      else
        #head :ok
        #render :json => { :display_as => obj.send(updating_attr)}
        val = obj.send(updating_attr)
        puts ">>>>>> #{val} #{val.class}"
        render :json => { :display_as => "#{val}"}
      end
    end

    def respond_bip_error(obj)
      render :json => obj.errors.full_messages, :status => :unprocessable_entity
    end
  end
end
