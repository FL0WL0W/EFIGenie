#include "Operations/IOperation.h"
#include "Service/EmbeddedOperationsRegister.h"
#include "Service/HardwareAbstractionServiceBuilder.h"

#ifdef IOPERATION_H

namespace Operations
{
    Service::ServiceLocator IOperationBase::factoryLocator;
    Service::ServiceLocator IOperationBase::packagerLocator;
    Service::ServiceLocator IOperationBase::executerLocator;

    void IOperationBase::Build(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
    {
        uint16_t instanceId = IService::CastAndOffset<uint16_t>(config, sizeOut);

        IOperationBase *operation = Create(serviceLocator, config, sizeOut);

        serviceLocator->RegisterIfNotNull(BUILDER_OPERATION, instanceId, operation);
    }

    void IOperationBase::BuildPackage(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
    {
        uint16_t instanceId = IService::CastAndOffset<uint16_t>(config, sizeOut);

        IOperationBase *operation = CreatePackage(serviceLocator, config, sizeOut);

        serviceLocator->RegisterIfNotNull(BUILDER_OPERATION, instanceId, operation);
    }

    void IOperationBase::BuildExecute(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
    {
        IOperationBase *operation = CreateExecute(serviceLocator, config, sizeOut);

        serviceLocator->LocateAndCast<HardwareAbstraction::CallBackGroup>(MAIN_LOOP_CALL_BACK_GROUP)->Add(reinterpret_cast<HardwareAbstraction::ICallBack *>(operation));
    }

    IOperationBase *IOperationBase::Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
    {
        IOperationBase*(*factory)(Service::ServiceLocator * const &, const void *, unsigned int &) = GetFactory(IService::CastAndOffset<uint16_t>(config, sizeOut));

        if(factory == 0)
            return 0;
        return factory(serviceLocator, config, sizeOut);
    }

    IOperationBase *IOperationBase::CreatePackage(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
    {
        IOperationBase*(*packager)(Service::ServiceLocator * const &, const void *, unsigned int &) = GetPackager(IService::CastAndOffset<uint16_t>(config, sizeOut));

        if(packager == 0)
            return 0;
        return packager(serviceLocator, config, sizeOut);
    }

    IOperationBase *IOperationBase::CreateExecute(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
    {
        IOperationBase*(*executer)(Service::ServiceLocator * const &, const void *, unsigned int &) = GetExecuter(IService::CastAndOffset<uint16_t>(config, sizeOut));

        if(executer == 0)
            return 0;
        return executer(serviceLocator, config, sizeOut);
    }
    
    IOperationBase*(*IOperationBase::GetFactory(uint16_t factoryId))(Service::ServiceLocator * const &, const void *, unsigned int &)
    {
        return factoryLocator.LocateAndCast<IOperationBase*(Service::ServiceLocator * const &, const void *, unsigned int &)>(factoryId);
    }

    IOperationBase*(*IOperationBase::GetPackager(uint16_t factoryId))(Service::ServiceLocator * const &, const void *, unsigned int &)
    {
        return packagerLocator.LocateAndCast<IOperationBase*(Service::ServiceLocator * const &, const void *, unsigned int &)>(factoryId);
    }

    IOperationBase*(*IOperationBase::GetExecuter(uint16_t factoryId))(Service::ServiceLocator * const &, const void *, unsigned int &)
    {
        return executerLocator.LocateAndCast<IOperationBase*(Service::ServiceLocator * const &, const void *, unsigned int &)>(factoryId);
    }
    
    void IOperationBase::RegisterServiceFactory()                                   			
    {                                                           					
        if(serviceFactoryLocator.Locate(BUILDER_OPERATION) == 0)                                  	
            serviceFactoryLocator.Register(BUILDER_OPERATION, reinterpret_cast<void *>(Build));		
        if(serviceFactoryLocator.Locate(BUILDER_OPERATIONPACKAGE) == 0)                                  	
            serviceFactoryLocator.Register(BUILDER_OPERATIONPACKAGE, reinterpret_cast<void *>(BuildPackage));	
        if(serviceFactoryLocator.Locate(BUILDER_OPERATIONEXECUTE) == 0)                                  	
            serviceFactoryLocator.Register(BUILDER_OPERATIONEXECUTE, reinterpret_cast<void *>(BuildExecute));		
    }
}

#endif