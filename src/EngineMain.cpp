#include "EngineMain.h"
#include "Operations/OperationFactoryRegister.h"
#include "Operations/EmbeddedIOOperationFactoryRegister.h"
#include "Operations/ReluctorOperationFactoryRegister.h"
#include "Operations/EngineOperationFactoryRegister.h"
#include "Operations/OperationPackager.h"
#include "Config.h"

using namespace OperationArchitecture;

namespace Engine
{
    void EngineMain::Start(EmbeddedIOServices::EmbeddedIOServiceCollection *embeddedIOServiceCollection, const void *config, unsigned int &sizeOut)
    {
        OperationFactory *operationFactory = new OperationFactory();
        SystemBus *systemBus = new SystemBus();
        OperationPackager *packager = new OperationPackager(operationFactory, systemBus);

        OperationFactoryRegister::Register(10000, operationFactory);
        EmbeddedIOOperationFactoryRegister::Register(20000, operationFactory, embeddedIOServiceCollection);
        ReluctorOperationFactoryRegister::Register(30000, operationFactory);
        EngineOperationFactoryRegister::Register(40000, operationFactory, embeddedIOServiceCollection, packager);

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
        IOperationBase *inputsExecute = packager->Package(config, size);
        Config::OffsetConfig(config, sizeOut, size);

        size = 0;
        IOperationBase *preSyncExecute = packager->Package(config, size);
        Config::OffsetConfig(config, sizeOut, size);

        size = 0;
        IOperationBase *syncCondition = packager->Package(config, size);
        Config::OffsetConfig(config, sizeOut, size);

        size = 0;
        IOperationBase *mainLoopExecute = packager->Package(config, size);
        Config::OffsetConfig(config, sizeOut, size);


        inputsExecute->Execute();
        preSyncExecute->Execute();

        while(true)
        {
            inputsExecute->Execute();
            while(syncCondition->Execute<bool>())
            {
                mainLoopExecute->Execute();
            }
        }
    }
}