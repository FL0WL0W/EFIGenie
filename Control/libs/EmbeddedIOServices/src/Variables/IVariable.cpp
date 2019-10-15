#include "Variables/IVariable.h"
#include "Service/EmbeddedVariablesRegister.h"
#include "Service\HardwareAbstractionServiceBuilder.h"

#ifdef IVARIABLE_H

namespace Variables
{
    Service::ServiceLocator IVariable::factoryLocator;

    void IVariable::Build(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
    {
        IVariable *variableService = Create(serviceLocator, config, sizeOut);

		serviceLocator->LocateAndCast<CallBackGroup>(MAIN_LOOP_CALL_BACK_GROUP)->Add(new CallBack<IVariable>(variableService, &IVariable::TranslateValue));
    }

    void IVariable::BuildCallBack(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
    {
        uint8_t instanceId = IService::CastAndOffset<uint8_t>(config, sizeOut);

        IVariable *variableService = Create(serviceLocator, config, sizeOut);

        serviceLocator->RegisterIfNotNull(BUILDER_VARIABLE_TRANSLATE_CALL_BACK, instanceId, new CallBack<IVariable>(variableService, &IVariable::TranslateValue));
    }

    IVariable *IVariable::Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
    {
        const uint16_t factoryId = IService::CastAndOffset<uint16_t>(config, sizeOut);

        IVariable*(*factory)(Service::ServiceLocator * const &, const void *, unsigned int &) = factoryLocator.LocateAndCast<IVariable*(Service::ServiceLocator * const &, const void *, unsigned int &)>(factoryId);

        if(factory == 0)
            return 0;
        return factory(serviceLocator, config, sizeOut);
    }
    
    ISERVICE_REGISTERSERVICEFACTORY_CPP(IVariable, BUILDER_VARIABLE)
    void IVariable::RegisterCallBackFactory()                                   			
    {                                                           					
        if(serviceFactoryLocator.Locate(BUILDER_VARIABLE_TRANSLATE_CALL_BACK) == 0)                                  
            serviceFactoryLocator.Register(BUILDER_VARIABLE_TRANSLATE_CALL_BACK, BuildCallBack); 								
    }
}

#endif