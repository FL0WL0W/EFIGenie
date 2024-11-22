#include "ExpanderMain.h"
#include "Operations/OperationFactoryRegister.h"
#include "Operations/EmbeddedIOOperationFactoryRegister.h"
#include "Operations/ReluctorOperationFactoryRegister.h"
#include "Operations/EngineOperationFactoryRegister.h"
#include "Operations/Operation_ReluctorGM24x.h"
#include "Config.h"
#include "CRC.h"

using namespace OperationArchitecture;
using namespace EmbeddedIOServices;
using namespace EmbeddedIOOperations;
using namespace ReluctorOperations;

namespace EFIGenie
{
    ExpanderMain::ExpanderMain(const void *config, size_t &sizeOut, const EmbeddedIOServiceCollection *embeddedIOServiceCollection, GeneratorMap<Variable> *variableMap)
    {
        const uint32_t configSize = *reinterpret_cast<const uint32_t *>(config) + sizeof(uint32_t);
        if(configSize == 0 || configSize > 100000)
            return;

        const uint32_t configCRC = CRC::CRC32(config, configSize);
        if(*reinterpret_cast<const uint32_t *>(reinterpret_cast<const uint8_t *>(config) + configSize) != configCRC)
        {
            return;
        }
        Config::OffsetConfig(config, sizeOut, sizeof(uint32_t));

        OperationFactory * operationFactory = new OperationFactory();

        OperationFactoryRegister::Register(10000, operationFactory, variableMap);
        EmbeddedIOOperationFactoryRegister::Register(20000, operationFactory, embeddedIOServiceCollection);
        ReluctorOperationFactoryRegister::Register(30000, operationFactory);
        EngineOperationFactoryRegister::Register(40000, operationFactory, embeddedIOServiceCollection);

        size_t size = 0;
        do
        {
            size = 0;
            const uint32_t operationId = Config::CastAndOffset<uint32_t>(config, sizeOut);
            if(operationId == 0)
                break;
            AbstractOperation *operation = operationFactory->Create(config, size);
            operationFactory->Register(operationId, operation);
            Config::OffsetConfig(config, sizeOut, size);
        }
        while(size > 0);

        size = 0;
        _mainLoopExecute = operationFactory->Create(config, size);
        Config::OffsetConfig(config, sizeOut, size);

        operationFactory->Clear();;
        delete _operationFactory;
        Config::OffsetConfig(config, sizeOut, sizeof(uint32_t));//CRC
    }

    ExpanderMain::~ExpanderMain()
    {
    }

    void ExpanderMain::Setup()
    {
    }

    void ExpanderMain::Loop()
    {
        _mainLoopExecute->Execute();
    }
}