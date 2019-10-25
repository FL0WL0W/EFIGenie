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

    IVariable *IVariable::Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
    {
        const uint16_t factoryId = IService::CastAndOffset<uint16_t>(config, sizeOut);

        IVariable*(*factory)(Service::ServiceLocator * const &, const void *, unsigned int &) = factoryLocator.LocateAndCast<IVariable*(Service::ServiceLocator * const &, const void *, unsigned int &)>(factoryId);

        if(factory == 0)
            return 0;
        return factory(serviceLocator, config, sizeOut);
    }
    
    ISERVICE_REGISTERSERVICEFACTORY_CPP(IVariable, BUILDER_VARIABLE)
}

#endif