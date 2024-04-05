import React, { useRef, useState, useEffect } from 'react';
import Highlighter from 'react-highlight-words';
import { SearchOutlined, EditTwoTone, DeleteTwoTone, FilterTwoTone, ExclamationCircleFilled } from '@ant-design/icons';

import { Table, Button, Row, Col, Spin, Modal, Divider, Input, Space, Popover, Dropdown , Tag} from 'antd';
import { Link } from 'react-router-dom';

import { DownOutlined } from '@ant-design/icons';
import moment from "moment";
import messageHandler from '../../utils/MessageHandler';
import FilterColumn from './Form/FilterColumn';


import Add_Update from './Form/Add_Update';
import { getStudents, deleteStudent } from '../../Service/StudentService';
import { getCources, deleteCource } from '../../Service/CourseService';
import { render } from '@testing-library/react';
const { confirm } = Modal;
const CoursesTable = () => {


  const [listData, setListData] = useState();

  const [updateItem, setUpdateItem] = useState(false);
  const [isOpenModel, setIsOpenModel] = useState(false);




  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };




  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? '#1677ff' : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: '#ffc069',
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const loadData = async () => {
    try {
      const result = await getCources();
      
      if (result === null) {
        messageHandler.error('Lỗi hệ thống');
        setListData([]);
      } else {
        if (result.status === 200) {
          setListData(result.data);
        } else {
          setListData([]);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setListData([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const delete_Action = async (item) => {
    confirm({
      title: 'Bạn chắc chắn muốn xóa học phần này không?',
      icon: <ExclamationCircleFilled />,
      // content: 'Some descriptions',

      okText: 'Có',
      okType: 'danger',
      cancelText: 'Không',
      onOk() {
        // console.log(item);
        handleDelete(item)
      },
      onCancel() {

      },
    });
  };

  const handleDelete = async (item) => {
    let result = null
    result = await deleteCource(item.courseId)

    if (result === null) {
      messageHandler.error('Lỗi hệ thống')
    } else {
      if (result.status === 200) {
        messageHandler.success('Xóa thành công')
        loadData()
      } else {
        messageHandler.error('Xóa thất bại')
      }
    }


  };

  const columns = [
    {
      title: 'STT',
      width: 100,
      dataIndex: 'stt',
      key: 'stt',
      align: "center",
    
      render: (text, record, index) => {
        const stt = index + 1;
        return stt;
      }
    },
    {
      title: 'Tên',
   
      dataIndex: 'name',
      key: 'name',
    
      ...getColumnSearchProps('name'),
     
    },
    {
      title: 'Môn học',
   
      dataIndex: 'Subject',
      key: 'Subject',


      render: (text,item) => {
        return (
          <> {item.Subject.name} </>
        );
       
      }
      
     
    },
  
    {
      title: 'Học kì',
     
      dataIndex: 'Semester',
      key: 'Semester',
      render: (text, item) =>{
        return(
          <>{item.Semester.name}</>
        );
      }
  
     
    },
    
    {
      title: 'Lớp',
    
      dataIndex: 'ClassSchool',
      key: 'ClassSchool',
      render : (text, item)=>{
        return (
          <>{item.ClassSchool.name}</>
        )
      }
   
     
    },

  
    {

      title: 'Trạng thái',
      dataIndex: 'active',
      key: 'active',
      align: 'center',
      fixed: 'right',
      render: (active) => <Tag color={active ? 'green' : "red"}>{active ? "Hoạt động" : "Ngưng hoạt động"}</Tag>,
      
    },
    {
      title: 'Tác vụ',
      key: 'tacVu',
      fixed: 'right',
      width: 80,
      fixed: 'right',
      


      render: (_, item) => {
        return (
          <>
            <EditTwoTone style={{ margin: 5 }} onClick={() => Update_Action(item)} />
            <DeleteTwoTone color='red' style={{ margin: 5 }} onClick={() => delete_Action(item)} />
            <br />
           
          </>
        );
      },

      // render: (_, item) => (
      //   <Space size="middle">
         
      //     <Dropdown
      //       menu={{
      //         itemActions,
      //       }}
      //     >
      //       <a>
      //         More <DownOutlined />
      //       </a>
      //     </Dropdown>
      //   </Space>
      // ),
    },
  ];


  const defaultCheckedList = columns.map((item) => item.key);
  const [checkedList, setCheckedList] = useState(defaultCheckedList);
  const options = columns.map(({ key, title }) => ({
    label: title,
    value: key,
  }));
  const newColumns = columns.map((item) => ({
    ...item,
    hidden: !checkedList.includes(item.key),
  }));

  const handleCheckboxChange = (checkedValues) => {
    setCheckedList(checkedValues);
  };
  
  const showModelAddUpdate = async () => {
    setIsOpenModel(true)
  }
  const closeModelAddUpdate = async () => {
    setIsOpenModel(false)
  }

  const Create_Action = () => {
    let addItem = {
      courseId: '',
      name: "",
      subjectId: "",
      semesterId: "",
      classSchoolId: "",
     
      active: true
    }
    setUpdateItem(addItem)
    showModelAddUpdate()
  }

  const Update_Action = (updateItem) => {

    setUpdateItem(updateItem)
    showModelAddUpdate()
  }

  return (
   
    listData?
    <>
      <Row style={{}}>
        <Col md={8} style={{ textAlign: 'left', fontSize: 20 }}>
      
          <Popover placement="bottomLeft" title='Filter' content={<FilterColumn checkedList= {checkedList} onCheckboxChange= {handleCheckboxChange}  options={options}/>}>

      
            <Button type="text"><FilterTwoTone /></Button>
          </Popover>
        </Col>

        <Col md={16} style={{ textAlign: 'right' }}>

          <Button type="primary" onClick={Create_Action}>Thêm học phần</Button>

        </Col>
      </Row>

      <Table
        columns={newColumns}
        rowKey='courseId'
        dataSource={listData}
        style={{ marginTop: 10 }}
        // scroll={{
        //   x: 2000,
        //   y: '55vh',
        // }}
      />

      <Add_Update
        isOpenModel={isOpenModel}
        data={updateItem}
        closeModelAddUpdate={closeModelAddUpdate}
        onFinishUpdate={(isAdd, data) => {
          // let dataUpdate = null;
          // if (isAdd) {
          //     dataUpdate = [...companyData];
          //     dataUpdate.push(data);
          // }
          // else{
          //   dataUpdate = companyData.map((item) => {
          //     if (item.maDaiLy === data.maDaiLy) {
          //       return data;
          //     }
          //     return item;
          //   });
          // } 
          // setCompanyData(dataUpdate);
          loadData()
        }}
      />

    </>
       :
       <div style={{
         textAlign: 'center',
         padding: '50px 50px', 
         textAlign: 'center', 
         borderRadius: 4,
         height:'100%' 
     }}>
         <Spin size='large' />
     </div>


  )
};
export default CoursesTable;