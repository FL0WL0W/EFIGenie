#include "Service/IService.h"
#include "Service/IService.h"
#include "HardwareAbstraction/ICallBack.h"
#include <tuple>
#define BUILDER_OPERATION 6001
#define BUILDER_OPERATIONPACKAGE 6002
#define BUILDER_OPERATIONEXECUTE 6003

/*
    To create an operator
    uint16									6001(BUILDER_OPERATION)
    uint16									xx(InstanceID of Operation)
    *operator creation*

    To package an operator
    uint16									6002(BUILDER_OPERATIONPACKAGE)
    uint16									xx(InstanceID of Operation)
    uint7                                   xx(Variable Channel to store result, 0 to not store) *irrelevant if result is void
    uint1                                   0/1(Create operator or use existing operator)
    *uint8                                  xx(Variable id for result if storing result otherwise skip) *irrelevant if result is void
    *operator*                              (uint16 ID if using existing, operator creation if creating)
    *parameters*
        uint8                               xx(Variable Channel if parameter is variable, 0 if using packaged operation)
        *packaged operation or uint8 variable id*
*/



#define IOPERATION_REGISTERFACTORY_CPP(cl, id)      				            \
void cl::RegisterFactory()                                         				\
{                                                           					\
    if(factoryLocator.Locate(id) == 0)                                       	\
        factoryLocator.Register(id, reinterpret_cast<void *>(Create));			\
    if(packagerLocator.Locate(id) == 0)                                       	\
        packagerLocator.Register(id, reinterpret_cast<void *>(CreatePackage));	\
    if(executerLocator.Locate(id) == 0)                                       	\
        executerLocator.Register(id, reinterpret_cast<void *>(CreateExecute));	\
}     

#ifndef IOPERATION_H
#define IOPERATION_H
namespace Operations
{
    class IOperationBase : public Service::IService
    {
        protected:
        static Service::ServiceLocator factoryLocator;
        static Service::ServiceLocator packagerLocator;
        static Service::ServiceLocator executerLocator;
        public:
		static void Build(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
		static void BuildPackage(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
		static void BuildExecute(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);

		static IOperationBase *Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
		static IOperationBase *CreatePackage(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
		static IOperationBase *CreateExecute(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
        
        static IOperationBase*(*GetFactory(uint16_t factoryId))(Service::ServiceLocator * const &, const void *, unsigned int &);
        static IOperationBase*(*GetPackager(uint16_t factoryId))(Service::ServiceLocator * const &, const void *, unsigned int &);
        static IOperationBase*(*GetExecuter(uint16_t factoryId))(Service::ServiceLocator * const &, const void *, unsigned int &);
        
        template<typename RET>
        static RET * GetOrCreateVariable(Service::ServiceLocator * const &serviceLocator, const uint8_t variableChannel, const uint8_t variableId)
        {
            RET *variable = serviceLocator->LocateAndCast<RET>(BUILDER_OPERATIONPACKAGE + variableChannel, variableId);
            if(variable == 0)
            {
                variable = (RET *)calloc(1, sizeof(RET));
                serviceLocator->Register(BUILDER_OPERATIONPACKAGE + variableChannel, variableId, variable);
            }

            return variable;
        }

        ISERVICE_REGISTERSERVICEFACTORY_H
    };

    template<typename RET, typename... PARAMS>
    class IOperation : public IOperationBase
    {
        public:
        virtual RET Execute(PARAMS...) = 0;
        static IOperationBase *CreatePackage(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
        static IOperationBase *CreateExecute(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
    };
    
    template<typename... PARAMS>
    class IOperation<void, PARAMS...> : public IOperationBase
    {
        public:
        virtual void Execute(PARAMS...) = 0;
        static IOperationBase *CreatePackage(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
        static IOperationBase *CreateExecute(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
    };

    template<>
    class IOperation<void> : public IOperationBase, HardwareAbstraction::ICallBack
    {
        public:
        virtual void Execute() = 0;
        static IOperationBase *CreatePackage(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
        {
            const uint8_t variableChannel = Service::IService::CastAndOffset<uint8_t>(config, sizeOut);
			if((variableChannel & 0x00) == 0)
                return reinterpret_cast<IOperationBase *>(Create(serviceLocator, config, sizeOut));
            return serviceLocator->LocateAndCast<IOperationBase>(BUILDER_OPERATION, Service::IService::CastAndOffset<uint16_t>(config, sizeOut));
        }
    };

    template<typename RET>
    struct OperationOrVariable
    {
        public:
            constexpr RET GetValue()
            {
                if(_operation)
                {
                    return reinterpret_cast<IOperation<RET> *>(_location)->Execute();
                }
                else
                {
                    return *reinterpret_cast<RET *>(_location);
                }                
            }
            static OperationOrVariable Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
            {
			    OperationOrVariable ov;

                const uint8_t variableChannel = Service::IService::CastAndOffset<uint8_t>(config, sizeOut);
                ov._operation = variableChannel == 0;

                if(ov._operation)
                {
                    ov._location = IOperationBase::CreatePackage(serviceLocator, config, sizeOut);
                }
                else
                {
                    ov._location = IOperationBase::GetOrCreateVariable<RET>(serviceLocator, variableChannel, Service::IService::CastAndOffset<uint8_t>(config, sizeOut));
                }         

                return ov;
            }
        protected:
            bool _operation;
            void *_location;
    };

    template<typename RET, typename... PARAMS>
    class Operation_Package : public IOperation<RET>
    {
        protected:
        IOperation<RET, PARAMS...> *_operation;
		std::tuple<OperationOrVariable<PARAMS>...> _operations;
        
		template<std::size_t... Is>
		RET ExecuteWithTuplePointers(std::tuple<OperationOrVariable<PARAMS>...>& tuple, std::index_sequence<Is...>) 
        {
			return _operation->Execute(static_cast<OperationOrVariable<PARAMS>>(std::get<Is>(tuple)).GetValue()...);
		}

        public:
        RET Execute() override
        {
            return ExecuteWithTuplePointers(_operations, std::index_sequence_for<PARAMS...>());
        }

        Operation_Package(IOperation<RET, PARAMS...> *operation, OperationOrVariable<PARAMS> ... operations) 
        {
            _operation = operation;
			_operations = std::tuple<OperationOrVariable<PARAMS>...>(operations...);
        }
    };

    template<typename RET>
    class Operation_StoreVariable : public IOperation<RET>
    {
        protected:
        RET *_result;
        IOperation<RET> *_operation;
        
        public:
        RET Execute() override
        {
            *_result = _operation->Execute();
            
            return *_result;
        }

        Operation_StoreVariable(RET *result, IOperation<RET> *operation) 
        {
            _result = result;
            _operation = operation;
        }
    };

    template<typename RET>
    class Operation_Execute : public IOperation<void>
    {
        protected:
        RET *_result;
        IOperation<RET> *_operation;
        
        public:
        void Execute() override
        {
            _operation->Execute();
        }

        Operation_Execute(IOperation<RET> *operation) 
        {
            _operation = operation;
        }
    };

    template<typename RET, typename... PARAMS>
    IOperationBase * IOperation<RET, PARAMS...>::CreatePackage(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
    {
        uint8_t variableChannel = Service::IService::CastAndOffset<uint8_t>(config, sizeOut);
        RET * variable = 0;
        if(variableChannel >> 1 != 0)
        {
            variable = IOperationBase::GetOrCreateVariable<RET>(serviceLocator, variableChannel >> 1, Service::IService::CastAndOffset<uint8_t>(config, sizeOut));
        }

        IOperation<RET, PARAMS...> *operation;
    	if((variableChannel & 0x00) == 0)
    	{
            operation = reinterpret_cast<IOperation<RET, PARAMS...> *>(Create(serviceLocator, config, sizeOut));
        }
        else
        {
            operation = serviceLocator->LocateAndCast<IOperation<RET, PARAMS...>>(BUILDER_OPERATION, Service::IService::CastAndOffset<uint16_t>(config, sizeOut));
        }
        Operation_Package<RET, PARAMS...> * const package = new Operation_Package<RET, PARAMS...>(operation, OperationOrVariable<PARAMS>::Create(serviceLocator, config, sizeOut)...);

        if(variable != 0)
            return reinterpret_cast<IOperationBase *>(new Operation_StoreVariable<RET>(variable, package));

        return reinterpret_cast<IOperationBase *>(package);
    }
    
    template<typename RET, typename... PARAMS>
    IOperationBase * IOperation<RET, PARAMS...>::CreateExecute(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
    {
        return reinterpret_cast<IOperationBase *>(new Operation_Execute<RET>(reinterpret_cast<Operation_Package<RET, PARAMS...> *>(CreatePackage(serviceLocator, config, sizeOut))));
    }
    
    
    template<typename... PARAMS>
    IOperationBase * IOperation<void, PARAMS...>::CreatePackage(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
    {
        const uint8_t variableChannel = Service::IService::CastAndOffset<uint8_t>(config, sizeOut);
        IOperation<void, PARAMS...> *operation;
        if((variableChannel & 0x00) == 0)
        {
            operation = reinterpret_cast<IOperation<void, PARAMS...> *>(Create(serviceLocator, config, sizeOut));
        }
        else
        {
            operation = serviceLocator->LocateAndCast<IOperation<void, PARAMS...>>(BUILDER_OPERATION, Service::IService::CastAndOffset<uint16_t>(config, sizeOut));
        }

        return reinterpret_cast<IOperationBase *>(new Operation_Package<void, PARAMS...>(operation, OperationOrVariable<PARAMS>::Create(serviceLocator, config, sizeOut)...));
    }

    template<typename... PARAMS>
    IOperationBase * IOperation<void, PARAMS...>::CreateExecute(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
    {
        return CreatePackage(serviceLocator, config, sizeOut);
    }
}
#endif