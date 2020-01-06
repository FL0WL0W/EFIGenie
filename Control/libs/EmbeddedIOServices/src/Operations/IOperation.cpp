#include "Operations/IOperation.h"
#include "Service/EmbeddedOperationsRegister.h"

#ifdef IOPERATION_H

namespace Operations
{
    Service::ServiceLocator Operations::IOperationBase::factoryLocator;

    void IOperationBase::Build(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
    {
        uint16_t instanceId = IService::CastAndOffset<uint16_t>(config, sizeOut);

        IOperationBase *operation = Create(serviceLocator, config, sizeOut);

        serviceLocator->RegisterIfNotNull(BUILDER_OPERATION, instanceId, operation);
    }

    IOperationBase *IOperationBase::Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
    {
        IOperationBase*(*factory)(Service::ServiceLocator * const &, const void *, unsigned int &) = GetFactory(IService::CastAndOffset<uint16_t>(config, sizeOut));

        if(factory == 0)
            return 0;
        return factory(serviceLocator, config, sizeOut);
    }
    
    IOperationBase*(*IOperationBase::GetFactory(uint16_t factoryId))(Service::ServiceLocator * const &, const void *, unsigned int &)
    {
        return factoryLocator.LocateAndCast<IOperationBase*(Service::ServiceLocator * const &, const void *, unsigned int &)>(factoryId);
    }
    
    ISERVICE_REGISTERSERVICEFACTORY_CPP(IOperationBase, BUILDER_OPERATION)
}

#endif