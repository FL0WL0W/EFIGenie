#include "EFIGenieMain.h"
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
    EFIGenieMain::EFIGenieMain(const void *config, size_t &sizeOut, const EmbeddedIOServiceCollection *embeddedIOServiceCollection, GeneratorMap<Variable> *variableMap)
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

        _operationFactory = new OperationFactory();

        OperationFactoryRegister::Register(10000, _operationFactory, variableMap);
        EmbeddedIOOperationFactoryRegister::Register(20000, _operationFactory, embeddedIOServiceCollection);
        ReluctorOperationFactoryRegister::Register(30000, _operationFactory);
        EngineOperationFactoryRegister::Register(40000, _operationFactory, embeddedIOServiceCollection);

        size_t size = 0;
        do
        {
            size = 0;
            const uint32_t operationId = Config::CastAndOffset<uint32_t>(config, sizeOut);
            if(operationId == 0)
                break;
            AbstractOperation *operation = _operationFactory->Create(config, size);
            _operationFactory->Register(operationId, operation);
            Config::OffsetConfig(config, sizeOut, size);
        }
        while(size > 0);

        _inputsExecute = _operationFactory->Create(config, sizeOut);
        Config::OffsetConfig(config, sizeOut, size);

        _preSyncExecute = _operationFactory->Create(config, sizeOut);

        _syncCondition = _operationFactory->Create(config, sizeOut);

        _mainLoopExecute = _operationFactory->Create(config, sizeOut);

        _operationFactory->Clear();;
        Config::OffsetConfig(config, sizeOut, sizeof(uint32_t));//CRC
    }

    EFIGenieMain::~EFIGenieMain()
    {
        if(_operationFactory != 0)
            delete _operationFactory;
    }

    void EFIGenieMain::Setup()
    {
        if(_inputsExecute != 0) _inputsExecute->Execute();
        if(_preSyncExecute != 0) _preSyncExecute->Execute();
    }

    void EFIGenieMain::Loop()
    {
        if(_inputsExecute != 0) _inputsExecute->Execute();
        if(!_syncedOnce && _syncCondition != 0)
            _syncedOnce = _syncCondition->Execute<bool>();
        if(_syncedOnce && _mainLoopExecute != 0)
        {
            _mainLoopExecute->Execute();
        }
    }
}