#include "EngineMain.h"
#include "Operations/OperationFactoryRegister.h"
#include "Operations/EmbeddedIOOperationFactoryRegister.h"
#include "Operations/OperationPackager.h"
#include "Config.h"

using namespace OperationArchitecture;

namespace Engine
{
    void EngineMain::Start(EmbeddedIOServices::EmbeddedIOServiceCollection *embeddedIOServiceCollection, const void *config, unsigned int &sizeOut)
    {
        OperationFactory *operationFactory = new OperationFactory(10000);
        OperationFactoryRegister::Register(operationFactory);

        EmbeddedIOOperationFactory *embeddedIOOperationFactory = new EmbeddedIOOperationFactory(embeddedIOServiceCollection, 20000);
        EmbeddedIOOperationFactoryRegister::Register(embeddedIOOperationFactory);
        operationFactory->RegisterSubFactory(embeddedIOOperationFactory);


        SystemBus *systemBus = new SystemBus();
        OperationPackager *packager = new OperationPackager(operationFactory, systemBus);
        
        unsigned int size = 0;
        do
        {
            size = 0;
            const uint32_t operationId = Config::CastAndOffset<uint32_t>(config, sizeOut);
            if(operationId == 0)
                break;
            systemBus->Operations.insert(std::pair<uint32_t, IOperationBase*>(operationId, packager->Package(config, size)));
            Config::OffsetConfig(config, sizeOut, size);
        }
        while(size > 0);

        size = 0;
        IOperationBase *preSyncExecute = packager->Package(config, size);
        Config::OffsetConfig(config, sizeOut, size);

        size = 0;
        IOperationBase *syncCondition = packager->Package(config, size);
        Config::OffsetConfig(config, sizeOut, size);

        size = 0;
        IOperationBase *mainLoopExecute = packager->Package(config, size);
        Config::OffsetConfig(config, sizeOut, size);

        preSyncExecute->Execute();

        while(true)
        {
            while(syncCondition->Execute<bool>())
            {
                mainLoopExecute->Execute();
            }
        }
    }
}